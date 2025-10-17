// =================================================================
// === API KEY YAHAN PASTE KARO ===
const API_KEY = "YAHAN_APNI_API_KEY_DAALO";
// =================================================================

async function checkGoogleSafeBrowsing(url) {
  if (!API_KEY || API_KEY === "YAHAN_APNI_API_KEY_DAALO") {
    console.log("API Key not found. Skipping Google Safe Browsing check.");
    return null;
  }
  const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`;
  const payload = {
    client: { clientId: "PhishingShield", clientVersion: "1.2.0" },
    threatInfo: {
      threatTypes: [
        "MALWARE",
        "SOCIAL_ENGINEERING",
        "UNWANTED_SOFTWARE",
        "POTENTIALLY_HARMFUL_APPLICATION",
      ],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url: url }],
    },
  };
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      console.error(
        "Safe Browsing API request failed with status:",
        response.status
      );
      return null;
    }
    const data = await response.json();
    return data.matches ? data.matches[0] : null;
  } catch (error) {
    console.error("Error calling Safe Browsing API:", error);
    return null;
  }
}

function analyzeUrl(url) {
  let score = 0;
  let reasons = [];
  const domain = new URL(url).hostname;
  const suspiciousKeywords = [
    "login",
    "verify",
    "account",
    "secure",
    "banking",
    "update",
    "password",
  ];
  suspiciousKeywords.forEach((keyword) => {
    if (url.includes(keyword)) {
      score -= 20;
      reasons.push(`Contains suspicious keyword: "${keyword}"`);
    }
  });
  if (url.includes("@")) {
    score -= 50;
    reasons.push("URL contains '@' symbol (classic phishing trick).");
  }
  const ipRegex = /^(https?:\/\/)?(\d{1,3}\.){3}\d{1,3}/;
  if (ipRegex.test(url)) {
    score -= 40;
    reasons.push("URL is a direct IP address.");
  }
  if ((domain.match(/\./g) || []).length > 3) {
    score -= 20;
    reasons.push("URL has an excessive number of subdomains.");
  }
  const shorteners = ["bit.ly", "t.co", "tinyurl.com"];
  if (shorteners.some((shortener) => domain.includes(shortener))) {
    score -= 20;
    reasons.push("URL uses a known link shortener.");
  }
  let status = "SAFE";
  if (score <= -50) {
    status = "DANGEROUS";
  } else if (score <= -20) {
    status = "SUSPICIOUS";
  }
  if (status !== "SAFE" && reasons.length === 0) {
    reasons.push("Flagged by general security heuristics.");
  }
  return { status, score, url, reasons };
}

// === FUNCTION MEIN CHANGE YAHAN HAI ===
function updateActionIcon(tabId, status, score) {
  // <-- Ab score bhi le rahe hain
  const iconPaths = {
    SAFE: { 16: "icons/safe_16.png", 48: "icons/safe_48.png" },
    SUSPICIOUS: {
      16: "icons/suspicious_16.png",
      48: "icons/suspicious_48.png",
    },
    DANGEROUS: { 16: "icons/danger_16.png", 48: "icons/danger_48.png" },
  };
  chrome.action.setIcon({ tabId: tabId, path: iconPaths[status] });

  // --- NEW CODE: BADGE TEXT AUR COLOR SET KARO ---
  let badgeText = score !== 0 ? String(score) : ""; // Safe (score 0) hai toh text khaali rakho
  let badgeColor = "#28a745"; // Green for SAFE

  if (status === "DANGEROUS") {
    badgeColor = "#dc3545"; // Red
  } else if (status === "SUSPICIOUS") {
    badgeColor = "#ffc107"; // Yellow
  }

  chrome.action.setBadgeText({ tabId: tabId, text: badgeText });
  chrome.action.setBadgeBackgroundColor({ tabId: tabId, color: badgeColor });
}
// === END OF FUNCTION CHANGE ===

// --- Main Event Listener (yahan bhi chhota sa change hai) ---
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    (tab.url.startsWith("http://") || tab.url.startsWith("https://"))
  ) {
    const url = tab.url;
    const domain = new URL(url).hostname;

    const { blacklist = [], whitelist = [] } = await chrome.storage.local.get([
      "blacklist",
      "whitelist",
    ]);

    if (whitelist.includes(domain)) {
      const finalResult = {
        status: "SAFE",
        score: 0,
        url: url,
        reasons: ["Manually trusted by user."],
      };
      updateActionIcon(tabId, "SAFE", 0); // <-- score 0 pass kiya
      return chrome.storage.local.set({ [tabId]: finalResult });
    }

    if (blacklist.includes(domain)) {
      const finalResult = {
        status: "DANGEROUS",
        score: -100,
        url: url,
        reasons: ["Manually reported as phishing by user."],
      };
      updateActionIcon(tabId, "DANGEROUS", -100); // <-- score -100 pass kiya
      return chrome.storage.local.set({ [tabId]: finalResult });
    }

    const googleThreat = await checkGoogleSafeBrowsing(url);
    if (googleThreat) {
      const reason = `Flagged by Google as ${googleThreat.threatType}.`;
      const finalResult = {
        status: "DANGEROUS",
        score: -200,
        url: url,
        reasons: [reason],
      };
      updateActionIcon(tabId, "DANGEROUS", -200); // <-- score -200 pass kiya
      return chrome.storage.local.set({ [tabId]: finalResult });
    }

    const analysisResult = analyzeUrl(url);
    // v-- yahan poora result pass kiya
    updateActionIcon(tabId, analysisResult.status, analysisResult.score);
    chrome.storage.local.set({ [tabId]: analysisResult }, () => {
      console.log(
        `Result for tab ${tabId} saved (local analysis):`,
        analysisResult
      );
    });
  }
});

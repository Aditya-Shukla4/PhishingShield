const API_KEY = "AIzaSyCmuPaH1HULd7IVw7C5sUrRW7sHi8TV-lE";

/**
 * Calls the Google Safe Browsing API to check if a URL is a known threat.
 * @param {string} url The URL to check.
 * @returns {Promise<object|null>} The threat match object if found, otherwise null.
 */
async function checkGoogleSafeBrowsing(url) {
  if (!API_KEY || API_KEY === "YAHAN_APNI_API_KEY_DAALO") {
    console.log("API Key not provided. Skipping Google Safe Browsing check.");
    return null;
  }

  const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`;
  const payload = {
    client: {
      clientId: "PhishingShield",
      clientVersion: "1.2.0", // Version incremented
    },
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

/**
 * Analyzes a URL based on a local set of heuristic rules.
 * @param {string} url The URL to analyze.
 * @returns {object} An object containing the analysis result.
 */
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

/**
 * Updates the extension's icon in the toolbar.
 * @param {number} tabId The ID of the tab to update.
 * @param {string} status The status to set ('SAFE', 'SUSPICIOUS', 'DANGEROUS').
 */
function updateActionIcon(tabId, status) {
  const iconPaths = {
    SAFE: { 16: "icons/safe_16.png", 48: "icons/safe_48.png" },
    SUSPICIOUS: {
      16: "icons/suspicious_16.png",
      48: "icons/suspicious_48.png",
    },
    DANGEROUS: { 16: "icons/danger_16.png", 48: "icons/danger_48.png" },
  };
  chrome.action.setIcon({ tabId: tabId, path: iconPaths[status] });
}

// --- Main Event Listener ---
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    (tab.url.startsWith("http://") || tab.url.startsWith("https://"))
  ) {
    const url = tab.url;
    const domain = new URL(url).hostname;

    // 1. Check user-defined lists first (highest priority)
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
      updateActionIcon(tabId, "SAFE");
      return chrome.storage.local.set({ [tabId]: finalResult });
    }

    if (blacklist.includes(domain)) {
      const finalResult = {
        status: "DANGEROUS",
        score: -100,
        url: url,
        reasons: ["Manually reported as phishing by user."],
      };
      updateActionIcon(tabId, "DANGEROUS");
      return chrome.storage.local.set({ [tabId]: finalResult });
    }

    // 2. Check Google Safe Browsing API
    const googleThreat = await checkGoogleSafeBrowsing(url);
    if (googleThreat) {
      console.log("Google Safe Browsing found a threat:", googleThreat);
      const reason = `Flagged by Google as ${googleThreat.threatType}.`;
      const finalResult = {
        status: "DANGEROUS",
        score: -200,
        url: url,
        reasons: [reason],
      };
      updateActionIcon(tabId, "DANGEROUS");
      return chrome.storage.local.set({ [tabId]: finalResult });
    }

    // 3. If no threat found yet, run our local heuristic analysis
    const analysisResult = analyzeUrl(url);
    updateActionIcon(tabId, analysisResult.status);
    chrome.storage.local.set({ [tabId]: analysisResult }, () => {
      console.log(
        `Result for tab ${tabId} saved (local analysis):`,
        analysisResult
      );
    });
  }
});

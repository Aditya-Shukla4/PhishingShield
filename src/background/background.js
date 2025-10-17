// =================================================================
// === API KEY YAHAN PASTE KARO ===
const API_KEY = "YAHAN_APNI_API_KEY_DAALO";
// =================================================================

/**
 * Calls the Google Safe Browsing API to check if a URL is a known threat.
 * @param {string} url The URL to check.
 * @returns {Promise<object|null>} The threat match object if found, otherwise null.
 */
async function checkGoogleSafeBrowsing(url) {
  if (!API_KEY || API_KEY === "YAHAN_APNI_API_KEY_DAALO") {
    console.log("API Key not found. Skipping Google Safe Browsing check.");
    return null;
  }
  const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`;
  const payload = {
    client: { clientId: "PhishingShield", clientVersion: "1.3.0" },
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
 * Updates the extension's icon and badge in the toolbar.
 * @param {number} tabId The ID of the tab to update.
 * @param {string} status The status to set ('SAFE', 'SUSPICIOUS', 'DANGEROUS').
 * @param {number} score The threat score.
 */
function updateActionIcon(tabId, status, score) {
  const iconPaths = {
    SAFE: {
      16: "src/assets/icons/safe_16.png",
      48: "src/assets/icons/safe_48.png",
    },
    SUSPICIOUS: {
      16: "src/assets/icons/suspicious_16.png",
      48: "src/assets/icons/suspicious_48.png",
    },
    DANGEROUS: {
      16: "src/assets/icons/danger_16.png",
      48: "src/assets/icons/danger_48.png",
    },
  };
  chrome.action.setIcon({ tabId: tabId, path: iconPaths[status] });
  let badgeText = score !== 0 ? String(score) : "";
  let badgeColor = "#28a745";
  if (status === "DANGEROUS") {
    badgeColor = "#dc3545";
  } else if (status === "SUSPICIOUS") {
    badgeColor = "#ffc107";
  }
  chrome.action.setBadgeText({ tabId: tabId, text: badgeText });
  chrome.action.setBadgeBackgroundColor({ tabId: tabId, color: badgeColor });
}

/**
 * Saves the latest scan result to the user's history.
 * @param {object} result The analysis result object.
 */
async function updateScanHistory(result) {
  const { scanHistory = [] } = await chrome.storage.local.get("scanHistory");
  const newHistoryEntry = {
    url: result.url,
    status: result.status,
    timestamp: new Date().toISOString(),
  };
  scanHistory.unshift(newHistoryEntry);
  const trimmedHistory = scanHistory.slice(0, 10);
  await chrome.storage.local.set({ scanHistory: trimmedHistory });
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

    const { blacklist = [], whitelist = [] } = await chrome.storage.local.get([
      "blacklist",
      "whitelist",
    ]);
    let finalResult; // Define a single variable to hold the outcome

    // 1. Check user-defined lists first (highest priority)
    if (whitelist.includes(domain)) {
      finalResult = {
        status: "SAFE",
        score: 0,
        url: url,
        reasons: ["Manually trusted by user."],
      };
    } else if (blacklist.includes(domain)) {
      finalResult = {
        status: "DANGEROUS",
        score: -100,
        url: url,
        reasons: ["Manually reported as phishing by user."],
      };
    } else {
      // 2. If not in user lists, check Google Safe Browsing
      const googleThreat = await checkGoogleSafeBrowsing(url);
      if (googleThreat) {
        const reason = `Flagged by Google as ${googleThreat.threatType}.`;
        finalResult = {
          status: "DANGEROUS",
          score: -200,
          url: url,
          reasons: [reason],
        };
      } else {
        // 3. If Google finds nothing, run our local analysis
        finalResult = analyzeUrl(url);
      }
    }

    // Perform all final actions once
    updateActionIcon(tabId, finalResult.status, finalResult.score);
    await chrome.storage.local.set({ [tabId]: finalResult });
    await updateScanHistory(finalResult);

    console.log(
      `Result for tab ${tabId} saved and history updated:`,
      finalResult
    );
  }
});

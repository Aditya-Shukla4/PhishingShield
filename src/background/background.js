// =================================================================
// === API KEY YAHAN PASTE KARO ===
const API_KEY = "AIzaSyCmuPaH1HULd7IVw7C5sUrRW7sHi8TV-lE";
const WHOIS_API_KEY = "at_56LwXSlfVXdvq8bbdgAXoEFSboKxH";
// =================================================================

const CACHE_DURATION_MS = 60 * 60 * 1000;

/**
 * Checks cache or calls Google Safe Browsing API.
 */
async function getGoogleSafeBrowsingResult(url) {
  const cacheKey = `cache_gsb_${url}`; // Cache key specific to GSB and URL
  const cachedData = await chrome.storage.local.get(cacheKey);

  // Check if valid cache exists and is recent
  if (
    cachedData[cacheKey] &&
    Date.now() - cachedData[cacheKey].timestamp < CACHE_DURATION_MS
  ) {
    console.log("Using cached GSB result for:", url);
    return cachedData[cacheKey].result;
  }

  // If no valid cache, call the API
  console.log("Fetching fresh GSB result for:", url);
  const result = await checkGoogleSafeBrowsingAPI(url); // Renamed original function

  // Save the new result (even if it's null) to cache with timestamp
  await chrome.storage.local.set({
    [cacheKey]: { result: result, timestamp: Date.now() },
  });
  return result;
}

/**
 * (Original function renamed) Calls the Google Safe Browsing API.
 */
async function checkGoogleSafeBrowsingAPI(url) {
  if (!API_KEY || API_KEY.includes("YAHAN_APNI")) {
    return null;
  }
  const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`;
  const payload = {
    client: { clientId: "PhishingShield", clientVersion: "1.7.0" },
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
      console.error("Safe Browsing API request failed:", response.status);
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
 * Analyzes a URL with local heuristic rules. (No change here)
 */
function analyzeUrl(url) {
  let score = 0;
  let reasons = [];
  const domain = new URL(url).hostname;
  if (!url.startsWith("https://")) {
    score -= 15;
    reasons.push("Site is not secure (uses HTTP).");
  }
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
    reasons.push("URL contains '@' symbol.");
  }
  const ipRegex = /^(https?:\/\/)?(\d{1,3}\.){3}\d{1,3}/;
  if (ipRegex.test(url)) {
    score -= 40;
    reasons.push("URL is a direct IP address.");
  }
  if ((domain.match(/\./g) || []).length > 3) {
    score -= 20;
    reasons.push("URL has excessive subdomains.");
  }
  const shorteners = ["bit.ly", "t.co", "tinyurl.com"];
  if (shorteners.some((shortener) => domain.includes(shortener))) {
    score -= 20;
    reasons.push("URL uses a known link shortener.");
  }
  let status = "SAFE";
  if (score <= -50) {
    status = "DANGEROUS";
  } else if (score < 0) {
    status = "SUSPICIOUS";
  }
  if (status !== "SAFE" && reasons.length === 0) {
    reasons.push("Flagged by general heuristics.");
  }
  return { status, score, url, reasons };
}

/**
 * Checks cache or calls Whois API to get domain age.
 */
async function getDomainAgeResult(domain) {
  const cacheKey = `cache_whois_${domain}`; // Cache key specific to Whois and domain
  const cachedData = await chrome.storage.local.get(cacheKey);

  // Check if valid cache exists and is recent
  if (
    cachedData[cacheKey] &&
    Date.now() - cachedData[cacheKey].timestamp < CACHE_DURATION_MS
  ) {
    console.log("Using cached Whois result for:", domain);
    return cachedData[cacheKey].result;
  }

  // If no valid cache, call the API
  console.log("Fetching fresh Whois result for:", domain);
  const result = await getDomainAgeAPI(domain, WHOIS_API_KEY); // Renamed original function

  // Save the new result (even if it's null) to cache with timestamp
  await chrome.storage.local.set({
    [cacheKey]: { result: result, timestamp: Date.now() },
  });
  return result;
}

/**
 * (Original function renamed) Gets the age of a domain in days using Whois API.
 */
async function getDomainAgeAPI(domain, apiKey) {
  if (!apiKey || apiKey.includes("YAHAN_APNI")) {
    return null;
  }
  const apiUrl = `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${apiKey}&domainName=${domain}&outputFormat=JSON`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.error("Whois API request failed:", response.status);
      return null;
    }
    const data = await response.json();
    const creationDateStr = data.WhoisRecord.createdDate;
    if (creationDateStr) {
      const creationDate = new Date(creationDateStr);
      const today = new Date();
      const ageInDays = Math.floor(
        (today - creationDate) / (1000 * 60 * 60 * 24)
      );
      return ageInDays;
    }
    return null;
  } catch (error) {
    console.error("Error calling Whois API:", error);
    return null;
  }
}

/**
 * Updates the extension's icon and badge. (No change here)
 */
function updateActionIcon(tabId, status, score) {
  const iconPaths = {
    SAFE: {
      16: chrome.runtime.getURL("src/assets/icons/safe_16.png"),
      48: chrome.runtime.getURL("src/assets/icons/safe_48.png"),
    },
    SUSPICIOUS: {
      16: chrome.runtime.getURL("src/assets/icons/suspicious_16.png"),
      48: chrome.runtime.getURL("src/assets/icons/suspicious_48.png"),
    },
    DANGEROUS: {
      16: chrome.runtime.getURL("src/assets/icons/danger_16.png"),
      48: chrome.runtime.getURL("src/assets/icons/danger_48.png"),
    },
  };
  chrome.action
    .setIcon({ tabId: tabId, path: iconPaths[status] })
    .catch((error) =>
      console.error(`Error setting icon for status ${status}:`, error)
    );
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
 * Saves the latest scan to history. (No change here)
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

/**
 * Shows a desktop notification. (No change here)
 */
function showNotification(reason, url) {
  const notificationId = `phishing-alert-${Date.now()}`;
  chrome.notifications.create(notificationId, {
    type: "basic",
    iconUrl: chrome.runtime.getURL("src/assets/icons/danger_128.png"),
    title: "Phishing Shield Alert",
    message: `Warning! This site appears dangerous.\nReason: ${reason}`,
    priority: 2,
  });
}

// --- Main Event Listener for Tab Updates (Updated to call caching functions) ---
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
    let finalResult;

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
      // === CALL CACHING FUNCTIONS INSTEAD OF DIRECT API FUNCTIONS ===
      const googleThreat = await getGoogleSafeBrowsingResult(url); // <-- Change here
      if (googleThreat) {
        const reason = `Flagged by Google as ${googleThreat.threatType}.`;
        finalResult = {
          status: "DANGEROUS",
          score: -200,
          url: url,
          reasons: [reason],
        };
      } else {
        finalResult = analyzeUrl(url);
        const domainAge = await getDomainAgeResult(domain); // <-- Change here
        if (domainAge !== null && domainAge < 30) {
          finalResult.score -= 25;
          finalResult.reasons.push(
            `Domain is very new (${domainAge} days old).`
          );
          if (finalResult.score <= -50) finalResult.status = "DANGEROUS";
          else if (finalResult.score < 0) finalResult.status = "SUSPICIOUS";
        }
      }
    }

    // Perform all final actions once
    updateActionIcon(tabId, finalResult.status, finalResult.score);
    await chrome.storage.local.set({ [tabId]: finalResult });
    await updateScanHistory(finalResult);

    // Show notification if dangerous
    if (finalResult.status === "DANGEROUS") {
      const primaryReason =
        finalResult.reasons.length > 0
          ? finalResult.reasons[0]
          : "Security analysis";
      showNotification(primaryReason, url);
    }

    console.log(
      `Result for tab ${tabId} saved and history updated:`,
      finalResult
    );
  }
});

// --- Listener for messages from content scripts (No change here) ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "DECEPTIVE_FORM_FOUND") {
    console.log("Message received from content script:", message);
    // TODO: Add logic here to update the score based on deceptive form
    sendResponse({ status: "Message received by background script" });
  }
  return true; // Required for async sendResponse
});

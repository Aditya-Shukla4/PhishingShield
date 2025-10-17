function analyzeUrl(url) {
  let score = 0;
  let result = {
    status: "SAFE",
    score: 0,
    url: url,
  };

  // Rule 1: Check for suspicious keywords in the URL
  const suspiciousKeywords = [
    "login",
    "verify",
    "account",
    "secure",
    "banking",
    "update",
    "password",
  ];
  if (suspiciousKeywords.some((keyword) => url.includes(keyword))) {
    score -= 20;
  }

  // Rule 2: Check for '@' symbol in the URL (classic phishing trick)
  if (url.includes("@")) {
    score -= 50;
  }

  // Rule 3: Check if the URL is an IP address
  const ipRegex = /^(https?:\/\/)?(\d{1,3}\.){3}\d{1,3}/;
  if (ipRegex.test(url)) {
    score -= 40;
  }

  // Rule 4: Check for too many dots (subdomains)
  const domain = new URL(url).hostname;
  if ((domain.match(/\./g) || []).length > 3) {
    score -= 20;
  }

  // Rule 5: Check for URL shorteners (a small list for now)
  const shorteners = ["bit.ly", "t.co", "tinyurl.com"];
  if (shorteners.some((shortener) => domain.includes(shortener))) {
    score -= 20;
  }

  // --- THE FIX IS HERE ---
  // Final Verdict based on score
  if (score <= -50) {
    result.status = "DANGEROUS";
  } else if (score <= -20) {
    result.status = "SUSPICIOUS";
  }
  // --- END OF FIX ---

  result.score = score;
  return result;
}

// Function to update the extension's icon based on the result
function updateActionIcon(tabId, status) {
  const iconPaths = {
    SAFE: {
      16: "icons/safe_16.png",
      48: "icons/safe_48.png",
    },
    SUSPICIOUS: {
      16: "icons/suspicious_16.png",
      48: "icons/suspicious_48.png",
    },
    DANGEROUS: {
      16: "icons/danger_16.png",
      48: "icons/danger_48.png",
    },
  };

  chrome.action.setIcon({
    tabId: tabId,
    path: iconPaths[status],
  });
}

// Main Event Listener: This is where the magic starts
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // We only want to run our analysis when the page has finished loading
  // and has a valid URL
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    (tab.url.startsWith("http://") || tab.url.startsWith("https://"))
  ) {
    // Analyze the URL
    const analysisResult = analyzeUrl(tab.url);

    // 1. Update the icon
    updateActionIcon(tabId, analysisResult.status);

    // 2. Save the result in storage for the popup to use
    chrome.storage.local.set({ [tabId]: analysisResult }, () => {
      console.log(`Result for tab ${tabId} saved:`, analysisResult);
    });
  }
});

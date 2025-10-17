// This script runs when the popup is opened.

// We need to get the currently active tab to find its ID
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const currentTabId = tabs[0].id;

  // Now, we retrieve the saved analysis result for this specific tab
  chrome.storage.local.get([String(currentTabId)], (result) => {
    const analysisResult = result[currentTabId];

    const messageElement = document.getElementById("status-message");
    const bodyElement = document.body;

    if (analysisResult) {
      // We found a result, let's display it
      const status = analysisResult.status;
      let message = `Status: ${status}`;

      messageElement.textContent = message;

      // Let's also change the popup's color for a better UX!
      if (status === "DANGEROUS") {
        bodyElement.style.backgroundColor = "#ffcccc"; // Light Red
      } else if (status === "SUSPICIOUS") {
        bodyElement.style.backgroundColor = "#fff3cd"; // Light Yellow
      } else {
        bodyElement.style.backgroundColor = "#d4edda"; // Light Green
      }
    } else {
      // If for some reason no result was found
      messageElement.textContent = "No analysis result found for this page.";
      bodyElement.style.backgroundColor = "#f0f0f0"; // Light Grey
    }
  });
});

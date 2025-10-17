document.addEventListener("DOMContentLoaded", () => {
  const statusText = document.getElementById("status-text");
  const scoreValue = document.getElementById("score-value");
  const reasonsList = document.getElementById("reasons-list");
  const bodyElement = document.body;
  const reportBtn = document.getElementById("report-btn");
  const trustBtn = document.getElementById("trust-btn");

  let currentTabId = null;
  let currentDomain = null;

  function renderPopup(analysisResult, storedLists) {
    const { blacklist = [], whitelist = [] } = storedLists;
    if (analysisResult) {
      let displayResult = { ...analysisResult };
      currentDomain = new URL(analysisResult.url).hostname;

      if (blacklist.includes(currentDomain)) {
        displayResult.status = "DANGEROUS";
        displayResult.score = -100;
        displayResult.reasons = ["Manually reported as phishing by user."];
      } else if (whitelist.includes(currentDomain)) {
        displayResult.status = "SAFE";
        displayResult.score = 0;
        displayResult.reasons = ["Manually trusted by user."];
      }

      const { status, score, reasons } = displayResult;
      statusText.textContent = status;
      statusText.className = `status-text status-${status}`;
      scoreValue.textContent = score;

      reasonsList.innerHTML = "";
      if (reasons && reasons.length > 0) {
        reasons.forEach((reason) => {
          const li = document.createElement("li");
          li.textContent = reason;
          reasonsList.appendChild(li);
        });
      } else if (status === "SAFE") {
        const li = document.createElement("li");
        li.textContent = "No threats detected. Happy browsing!";
        reasonsList.appendChild(li);
      }

      if (status === "DANGEROUS") bodyElement.style.backgroundColor = "#ffcccc";
      else if (status === "SUSPICIOUS")
        bodyElement.style.backgroundColor = "#fff3cd";
      else bodyElement.style.backgroundColor = "#d4edda";

      if (blacklist.includes(currentDomain)) {
        reportBtn.disabled = true;
        reportBtn.textContent = "Reported";
        trustBtn.disabled = false;
      } else if (whitelist.includes(currentDomain)) {
        trustBtn.disabled = true;
        trustBtn.textContent = "Trusted";
        reportBtn.disabled = false;
      }
    } else {
      statusText.textContent = "Not Analyzed";
      scoreValue.textContent = "N/A";
      bodyElement.style.backgroundColor = "#f0f0f0";
      reportBtn.style.display = "none";
      trustBtn.style.display = "none";
    }
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0 || !tabs[0].id) return;
    currentTabId = tabs[0].id;
    const currentTabIdStr = String(currentTabId);
    chrome.storage.local.get(
      [currentTabIdStr, "blacklist", "whitelist"],
      (result) => {
        const analysisResult = result[currentTabIdStr];
        renderPopup(analysisResult, result);
      }
    );
  });

  reportBtn.addEventListener("click", () => {
    chrome.storage.local.get(["blacklist", "whitelist"], (result) => {
      let { blacklist = [], whitelist = [] } = result;
      if (!blacklist.includes(currentDomain)) blacklist.push(currentDomain);
      whitelist = whitelist.filter((d) => d !== currentDomain);
      chrome.storage.local.set({ blacklist, whitelist }, () => {
        chrome.tabs.reload(currentTabId);
        window.close();
      });
    });
  });

  trustBtn.addEventListener("click", () => {
    chrome.storage.local.get(["blacklist", "whitelist"], (result) => {
      let { blacklist = [], whitelist = [] } = result;
      if (!whitelist.includes(currentDomain)) whitelist.push(currentDomain);
      blacklist = blacklist.filter((d) => d !== currentDomain);
      chrome.storage.local.set({ blacklist, whitelist }, () => {
        chrome.tabs.reload(currentTabId);
        window.close();
      });
    });
  });
});

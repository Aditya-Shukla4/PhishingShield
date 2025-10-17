// Function to render a list of domains for blacklist/whitelist
function renderManagedList(listName, domains) {
  const listElement = document.getElementById(listName);
  listElement.innerHTML = "";

  if (domains && domains.length > 0) {
    domains.forEach((domain) => {
      const listItem = document.createElement("li");
      const domainText = document.createElement("span");
      domainText.textContent = domain;
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.className = "delete-btn";

      deleteBtn.addEventListener("click", () => {
        const updatedDomains = domains.filter((d) => d !== domain);
        chrome.storage.local.set({ [listName]: updatedDomains }, () => {
          renderManagedList(listName, updatedDomains);
        });
      });

      listItem.appendChild(domainText);
      listItem.appendChild(deleteBtn);
      listElement.appendChild(listItem);
    });
  } else {
    const listItem = document.createElement("li");
    listItem.textContent = `No sites in your ${listName} yet.`;
    listItem.style.justifyContent = "center";
    listElement.appendChild(listItem);
  }
}

// === NAYA FUNCTION: HISTORY LIST DIKHANE KE LIYE ===
function renderHistoryList(history) {
  const listElement = document.getElementById("history-list");
  listElement.innerHTML = "";

  if (history && history.length > 0) {
    history.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.className = "history-item";

      const urlSpan = document.createElement("span");
      urlSpan.className = "history-url";
      urlSpan.textContent =
        item.url.length > 60 ? `${item.url.substring(0, 60)}...` : item.url;

      const detailsSpan = document.createElement("span");
      detailsSpan.className = "history-details";

      const statusSpan = document.createElement("span");
      statusSpan.className = `history-status status-${item.status}`;
      statusSpan.textContent = item.status;

      const timeSpan = document.createElement("span");
      timeSpan.textContent = `Scanned: ${new Date(
        item.timestamp
      ).toLocaleString()}`;

      detailsSpan.appendChild(statusSpan);
      detailsSpan.appendChild(timeSpan);
      listItem.appendChild(urlSpan);
      listItem.appendChild(detailsSpan);
      listElement.appendChild(listItem);
    });
  } else {
    const listItem = document.createElement("li");
    listItem.textContent = "No scan history yet. Visit some websites!";
    listItem.style.justifyContent = "center";
    listElement.appendChild(listItem);
  }
}

// Main function that runs when the options page is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Get all lists from storage and render them
  chrome.storage.local.get(
    ["whitelist", "blacklist", "scanHistory"],
    (result) => {
      renderManagedList("whitelist", result.whitelist || []);
      renderManagedList("blacklist", result.blacklist || []);
      renderHistoryList(result.scanHistory || []);
    }
  );
});

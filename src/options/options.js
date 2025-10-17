// Function to render a list of domains (either whitelist or blacklist)
function renderList(listName, domains) {
  const listElement = document.getElementById(listName);
  listElement.innerHTML = ""; // Clear the list first

  if (domains && domains.length > 0) {
    domains.forEach((domain) => {
      const listItem = document.createElement("li");

      const domainText = document.createElement("span");
      domainText.textContent = domain;

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.className = "delete-btn";

      // Add a click event listener to the delete button
      deleteBtn.addEventListener("click", () => {
        // Remove the domain from the array
        const updatedDomains = domains.filter((d) => d !== domain);

        // Save the updated list back to storage
        chrome.storage.local.set({ [listName]: updatedDomains }, () => {
          console.log(`${domain} removed from ${listName}`);
          // Re-render the list to show the change immediately
          renderList(listName, updatedDomains);
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

// Main function that runs when the options page is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Get both lists from storage and render them
  chrome.storage.local.get(["whitelist", "blacklist"], (result) => {
    renderList("whitelist", result.whitelist || []);
    renderList("blacklist", result.blacklist || []);
  });
});

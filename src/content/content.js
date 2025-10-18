function analyzeForms() {
  console.log("[Phishing Shield] Content script running, analyzing forms...");
  const passwordFields = document.querySelectorAll('input[type="password"]');

  if (passwordFields.length === 0) {
    console.log("[Phishing Shield] No password fields found on this page.");
    return; // No password fields, no work to do
  }

  passwordFields.forEach((field) => {
    const form = field.closest("form");
    if (form) {
      const formAction = form.action;
      const currentPageDomain = window.location.hostname;

      // Resolve the form's action URL to get its full hostname
      const formActionUrl = new URL(formAction, window.location.href);
      const formActionDomain = formActionUrl.hostname;

      // Check if the form submits to a different domain
      // We check if the form's domain ENDS WITH the page's domain to allow for subdomains (e.g., login.google.com on google.com)
      if (!formActionDomain.endsWith(currentPageDomain)) {
        console.log(
          `[Phishing Shield] Deceptive form found! Page is ${currentPageDomain}, but form submits to ${formActionDomain}`
        );

        // Send a message to the background script with our findings
        chrome.runtime.sendMessage({
          type: "DECEPTIVE_FORM_FOUND",
          payload: {
            pageDomain: currentPageDomain,
            formActionDomain: formActionDomain,
          },
        });
      }
    }
  });
}

// Run the analysis
analyzeForms();

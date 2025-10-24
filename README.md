# PhishingShield 🛡️

**A robust, real-time browser extension that detects and warns users against sophisticated phishing threats through a sophisticated, multi-layered analysis of every URL.**

[![GitHub license](https://img.shields.io/github/license/Aditya-Shukla4/PhishingShield)](https://github.com/Aditya-Shukla4/PhishingShield/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Aditya-Shukla4/PhishingShield?style=social)](https://github.com/Aditya-Shukla4/PhishingShield/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Aditya-Shukla4/PhishingShield?style=social)](https://github.com/Aditya-Shukla4/PhishingShield/network/members)

---

## 💡 Vision: Securing the Digital Frontier

The digital landscape is constantly under siege from evolving phishing attacks. Our vision for **PhishingShield** is to provide an **accessible, lightweight, and unintrusive layer of security** for every web user. We aim to move beyond simple blocklists and develop a smart, behavioral-based detection system that protects users in real-time, empowering them to browse the internet with confidence and peace of mind.

---

## ✨ Core Features Implemented

### 🛡️ Multi-Layered Threat Detection

The extension employs a robust, four-step process to analyze URLs in real-time and ensure maximum security:

1.  **User-Defined Lists (Highest Priority):**
    * **Whitelist:** URLs on this list are considered **always safe** and bypass further checks.
    * **Blacklist:** URLs on this list are considered **always dangerous** and are blocked immediately.
2.  **Google Safe Browsing API:**
    * The URL is checked against Google's massive, frequently updated database of known threats (phishing, malware, etc.).
3.  **Domain Age Analysis (Whois API):**
    * The domain's registration date is retrieved. **Very new domains (e.g., less than 30 days old)** are heavily penalized, as they are frequently used for 'hit-and-run' phishing campaigns.
4.  **Heuristic Analysis (Final Check):**
    * The URL is scrutinized for suspicious patterns and characteristics:
        * Insecure protocols (`http` instead of `https`).
        * Phishing keywords (e.g., `login`, `secure`, `bank`).
        * Use of raw **IP addresses** instead of a domain name.
        * An excessive number of **subdomains**.

### 🖥️ Advanced User Interface (UI) & Experience (UX)

Security information is delivered to the user clearly and intuitively:

* **Dynamic Icon and Badge:** The extension icon changes color based on the threat level (Green/Yellow/Red) and displays a numerical **threat score** on a badge for at-a-glance information.
* **Detailed "Report Card" Popup:** Clicking the icon displays a comprehensive breakdown: final security status, the calculated threat score, and a list of specific reasons why the site was flagged.
* **Full "Control Room" (Settings Page):** A dedicated options page for users to manage their personal **Whitelist** and **Blacklist**, and access the **Scan History**.
* **Scan History:** Displays a history of the **last 10 scanned websites** and their final security results for easy review.

### 💻 Professional Codebase

The extension is built on a modern, maintainable, and efficient foundation:

* **Organized Structure:** The code is logically organized into a clean folder structure (`background`, `popup`, `options`, `content`, `assets`) following best practices for web extensions.
* **Asynchronous Operations:** All API calls and heavy operations utilize **modern `async/await` syntax** to ensure the browser remains responsive and the UI never freezes during a security scan.

---

## 🔬 Core Detection Logic (The "Uniqueness")

PhishingShield's strength lies in its **heuristic analysis**—a set of rules that identify characteristics unique to malicious URLs, moving beyond simple static blacklists. Our detection model is based on the following key metrics:

### 1. **URL Structure Anomaly Detection**
We flag URLs that exhibit common phisher tactics to confuse users:
* **Length-Based Suspicion:** URLs exceeding **100 characters** are marked as highly suspicious.
* **Excessive Sub-domains:** URLs with **more than three periods** (e.g., `login.verify.paypal.com.scam-site.net`) are flagged.
* **IP Address Hostname:** Direct use of an **IP address** (e.g., `http://192.168.1.1/login`) instead of a domain name is a strong indicator of a non-standard, potentially malicious site.

### 2. **Visual & Character Impersonation**
This is a critical layer for detecting modern, subtle attacks:
* **Homograph Attacks (Punny Code):** The extension scans the URL for **non-ASCII (Unicode)** characters that are visually identical to standard Latin letters (e.g., using 'а' from the Cyrillic alphabet instead of 'a').
* **Brand Keyword Scrutiny:** We look for combinations of popular keywords (like *'google,' 'amazon,' 'bank'*) paired with suspicious suffixes or misspellings within the main domain name.

### 3. **Real-Time Data Feeds (Future Vision)**
While currently relying on heuristics, our vision is to incorporate a mechanism that allows the extension to ingest and quickly apply recently reported phishing patterns and simple blacklisted domains, offering **zero-day protection** against emerging threats.

---

## 🚀 Enhancements and Future Roadmap

| Feature | Status |
| :--- | :--- |
| Detailed "Report Card" Popup | ✅ Completed |
| User-Managed Whitelist/Blacklist | ✅ Completed |
| Scan History Tracking | ✅ Completed |
| Google Safe Browsing & Whois API Integration | ✅ Completed |
| Browser Notifications (Toast Alerts) | ⏳ To Do |
| On-Page Content Analysis (Content Scripts) | ⏳ To Do |
| Multi-Browser Support (Firefox, Edge) | ⏳ To Do |
| Machine Learning Integration | 🔭 Planned |
---

## 🛠️ Installation

### Prerequisites

You need a Chromium-based browser (like Chrome or Brave) or Firefox to install and run the extension.

### Manual Installation (Developer Mode)

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Aditya-Shukla4/PhishingShield.git](https://github.com/Aditya-Shukla4/PhishingShield.git)
    ```
2.  **Open Extension Manager:** Navigate to `chrome://extensions` in your browser.
3.  **Enable Developer Mode:** Toggle the **Developer mode** switch in the upper right corner.
4.  **Load Unpacked:** Click the **"Load unpacked"** button and select the cloned `PhishingShield` directory.
5.  **Activation:** The extension is now installed! Pin the PhishingShield icon to your toolbar for easy access.

---

## 📄 Technology Stack

* **Core Language:** JavaScript
* **Frontend:** HTML5, CSS3
* Browser APIs: chrome.tabs, chrome.storage, chrome.action, chrome.runtime

---

## 🤝 Contributing

We welcome contributions! Whether it's adding a new detection heuristic, fixing a bug, or improving documentation, your help is appreciated.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE file](https://github.com/Aditya-Shukla4/PhishingShield/blob/main/LICENSE) for details.

---

## 👤 Author

**Aditya Shukla**

* [GitHub Profile](https://github.com/Aditya-Shukla4)
* [Email](mailto:As1384909@gmail.com)

# PhishingShield 🛡️

**A robust, real-time browser extension to detect and warn users against sophisticated phishing threats.**

[![GitHub license](https://img.shields.io/github/license/Aditya-Shukla4/PhishingShield)](/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Aditya-Shukla4/PhishingShield?style=social)](https://github.com/Aditya-Shukla4/PhishingShield/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Aditya-Shukla4/PhishingShield?style=social)](https://github.com/Aditya-Shukla4/PhishingShield/network/members)

---

## 💡 Vision: Securing the Digital Frontier

The digital landscape is constantly under siege from evolving phishing attacks. Our vision for **PhishingShield** is to provide an **accessible, lightweight, and unintrusive layer of security** for every web user. We aim to move beyond simple blocklists and develop a smart, behavioral-based detection system that protects users in real-time, empowering them to browse the internet with confidence and peace of mind.

---

## ✨ Key Features

PhishingShield utilizes simple, yet powerful JavaScript techniques to analyze web pages and URLs instantaneously, offering the following core protections:

* **Real-Time Phishing Detection:** The extension actively monitors the visited URL immediately upon navigation, comparing it against a set of heuristic rules and known malicious patterns.
* **Intuitive Warning System:** When a suspicious or confirmed phishing site is detected, the user is immediately shown a **prominent and unavoidable alert**, preventing them from entering sensitive information.
* **Domain Heuristics Analysis:** It analyzes several key indicators of potential phishing, including:
    * **Suspicious Character/Homograph Detection** (e.g., using Unicode characters that look like Latin letters).
    * **Sub-Domain and Path Scrutiny** (e.g., deeply nested or excessively long URLs).
    * **Common Brand Impersonation** (identifying attempts to mimic popular banking or e-commerce domains).
* **Lightweight & Fast:** Built purely with Vanilla JavaScript, HTML, and CSS, ensuring minimal impact on browser performance and fast detection times.
* **Immediate Feedback:** Provides a quick, one-click mechanism for users to report potential false positives or flag a new phishing site.

---

## 🔬 Core Detection Logic (The "Uniqueness")

PhishingShield's strength lies in its **heuristic analysis**—a set of rules that identify characteristics unique to malicious URLs, moving beyond simple static blacklists. Our detection model is based on the following key metrics:

### 1. **URL Structure Anomaly Detection**
We flag URLs that exhibit common phisher tactics to confuse users:
* **Length-Based Suspicion:** URLs exceeding **100 characters** are marked as highly suspicious, as legitimate sites rarely require such long addresses.
* **Excessive Sub-domains:** We analyze the domain structure. URLs with **more than three periods** (e.g., `login.verify.paypal.com.scam-site.net`) are flagged, as legitimate sites keep their domain structure simple.
* **IP Address Hostname:** Direct use of an **IP address** (e.g., `http://192.168.1.1/login`) instead of a domain name is a strong indicator of a non-standard, potentially malicious site.

### 2. **Visual & Character Impersonation**
This is a critical layer for detecting modern, subtle attacks:
* **Homograph Attacks (Punny Code):** The extension scans the URL for **non-ASCII (Unicode)** characters that are visually identical to standard Latin letters (e.g., using 'а' from the Cyrillic alphabet instead of 'a'). This is a primary method phishers use to spoof popular brand names.
* **Brand Keyword Scrutiny:** We look for combinations of popular keywords (like *'google,' 'amazon,' 'bank'*) paired with suspicious suffixes or misspellings within the main domain name.

### 3. **Real-Time Data Feeds (Future Vision)**
While currently relying on heuristics, our vision is to incorporate a mechanism that:
* **Feeds New Threat Data:** Allows the extension to ingest and quickly apply recently reported phishing patterns and simple blacklisted domains, offering **zero-day protection** against emerging threats.

---

## 🚀 Enhancements and Future Roadmap

Our goal is continuous improvement to stay ahead of malicious actors. Future planned enhancements include:

| Category | Enhancement Detail | Status |
| :--- | :--- | :--- |
| **Detection** | **Machine Learning Integration:** Develop a local or cloud-based ML model to analyze page content, HTML structure, and favicon history for a deeper level of security. | *Planned* |
| **Usability** | **Customizable Whitelist:** Allow users to manually whitelist trusted domains to avoid unnecessary warnings. | *To Do* |
| **Feedback** | **Decentralized Threat Database:** Implement a system to securely share anonymized threat data across users, allowing the extension to learn from the community's input. | *Vision* |
| **Performance** | **Multi-Browser Support:** Official support and publication for Firefox, Edge, and other popular browser stores. | *To Do* |
| **Interface** | **Detailed Risk Report:** When a threat is detected, provide a brief, educational report explaining *why* the site was flagged (e.g., "Suspicious domain age," "Too many redirects"). | *To Do* |

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
* **Browser APIs:** Chrome/Web Extension APIs (`webRequest`, `tabs`, `storage`)

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

This project is licensed under the **MIT License**. See the [LICENSE](/Aditya-Shukla4/PhishingShield/blob/main/LICENSE) file for details.

---

## 👤 Author

**Aditya Shukla**

* [GitHub Profile](https://github.com/Aditya-Shukla4) 
* [Gmail](https://github.com/Aditya-Shukla4) 

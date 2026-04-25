# 🛡️ PhishGuard — AI Phishing Forensics Sandbox

Detect phishing emails and malicious URLs instantly using AI — directly from your browser.

---

## 🚀 Overview

PhishGuard is a full-stack cybersecurity tool that:

* 🔍 Analyzes suspicious emails and URLs
* 🧠 Uses AI to detect phishing patterns
* ⚡ Provides instant risk scores and explanations
* 🧩 Works as a Chrome Extension + Web App

---

## 🌐 Live Demo

👉 https://phishguard-rouge.vercel.app

---

## 🧩 Chrome Extension

### Run Locally

1. Clone the repo:

```bash
git clone https://github.com/YOUR_USERNAME/phishguard.git
```

2. Go to Chrome:

```text
chrome://extensions/
```

3. Enable **Developer Mode**

4. Click **Load unpacked**

5. Select:

```text
phishguard-extension/
```

---

## 💻 Web App Setup

### 1. Navigate to app

```bash
cd phishguard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add environment variable

Create `.env.local`:

```env
GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE
```

### 4. Run locally

```bash
npm run dev
```

---

## ⚙️ Tech Stack

* **Frontend:** Next.js, Tailwind CSS
* **Backend:** Next.js API Routes
* **AI Engine:** Groq (Llama 3)
* **Deployment:** Vercel
* **Extension:** Chrome Extension (Manifest V3)

---

## 🧠 How It Works

1. User inputs email or URL
2. Request sent to `/api/analyze`
3. Backend calls Groq API
4. AI returns structured analysis
5. UI displays:

   * Risk level
   * Score
   * Explanation
   * Recommended actions

---

## 🧪 Example Use Cases

* Phishing email detection
* Suspicious link verification
* Browser-level security tool
* Cybersecurity awareness demos

---

## 🔒 Security Notes

* API keys are stored securely using environment variables
* No sensitive data is stored
* All analysis is done in real-time

---

## ⚠️ Demo Mode

If API limits are hit, the system falls back to predefined responses to ensure uninterrupted demo experience.

---

## 🚀 Future Improvements

* Real-time email scanning
* URL reputation database
* Multi-model AI fallback
* Chrome Web Store deployment

---

## 🤝 Contributing

Pull requests are welcome!
Feel free to open issues for suggestions or bugs.

---

## 📄 License

MIT License

---

## 👨‍💻 Author

Built by Sagnik Ghosh

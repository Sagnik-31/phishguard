"use strict";

const BASE_URL = "https://phishguard-rouge.vercel.app";
const ANALYZE_ENDPOINT = `${BASE_URL}/api/analyze`;
const STORAGE_KEY = "phishguard_last_result";
const COOLDOWN_MS = 2500;
const MAX_INPUT_LENGTH = 2000;
const FALLBACK_MESSAGE = "⚠️ Using demo result due to API limits";

const WEBMAIL_PATTERNS = [
  "mail.google.com",
  "outlook.live.com",
  "outlook.office.com",
  "mail.yahoo.com",
];

const elements = {
  analyzeButton: document.getElementById("analyzeButton"),
  reportButton: document.getElementById("reportButton"),
  currentUrl: document.getElementById("currentUrl"),
  contextBadge: document.getElementById("contextBadge"),
  emailPreview: document.getElementById("emailPreview"),
  emailSubject: document.getElementById("emailSubject"),
  emailSender: document.getElementById("emailSender"),
  emailSnippet: document.getElementById("emailSnippet"),
  statusPill: document.getElementById("statusPill"),
  resultSection: document.getElementById("resultSection"),
  riskBadge: document.getElementById("riskBadge"),
  scoreValue: document.getElementById("scoreValue"),
  explanation: document.getElementById("explanation"),
  actions: document.getElementById("actions"),
  message: document.getElementById("message"),
};

let activeTabUrl = "";
let activeTabId = null;
let lastResult = null;
let isLoading = false;
let cooldownUntil = 0;
let analysisMode = "website"; // "website" | "email"
let extractedEmail = null;

// ─── Bootstrap ──────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {
  wireEvents();
  await hydrateFromStorage();
  await loadActiveTab();
  if (activeTabUrl) {
    await analyzeCurrentPage();
  }
});

function wireEvents() {
  elements.analyzeButton.addEventListener("click", analyzeCurrentPage);
  elements.reportButton.addEventListener("click", openFullReport);
}

// ─── Tab & Context Detection ────────────────────────────

async function loadActiveTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    activeTabUrl = tab?.url || "";
    activeTabId = tab?.id ?? null;

    if (!activeTabUrl) {
      setMessage("Unable to read the current tab URL.", "error");
      elements.currentUrl.textContent = "No active tab detected";
      return;
    }

    elements.currentUrl.textContent = activeTabUrl;
    elements.currentUrl.title = activeTabUrl;

    // Detect if on a webmail page
    const isWebmail = WEBMAIL_PATTERNS.some((pattern) => activeTabUrl.includes(pattern));

    if (isWebmail) {
      analysisMode = "email";
      showContextBadge("📧 Email Detected");
      elements.analyzeButton.textContent = "Analyze Email";
      await tryExtractEmail();
    } else {
      analysisMode = "website";
      showContextBadge("🌐 Website");
      elements.analyzeButton.textContent = "Analyze Current Page";
    }
  } catch (error) {
    setMessage("Chrome blocked access to the current tab.", "error");
    elements.currentUrl.textContent = "Unable to read current tab";
  }
}

function showContextBadge(text) {
  elements.contextBadge.textContent = text;
  elements.contextBadge.classList.remove("hidden");
}

// ─── Email Extraction ───────────────────────────────────

async function tryExtractEmail() {
  if (!activeTabId) {
    return;
  }

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: activeTabId },
      files: ["content.js"],
    });

    const data = results?.[0]?.result;
    console.log("[PhishGuard] Email extraction result:", data);

    if (data && (data.subject || data.body)) {
      extractedEmail = data;
      showEmailPreview(data);
    } else {
      console.log("[PhishGuard] No email content found, falling back to URL.");
      extractedEmail = null;
      hideEmailPreview();
      // Still in email mode but will analyze URL as fallback
    }
  } catch (error) {
    console.error("[PhishGuard] Email extraction failed:", error);
    extractedEmail = null;
    hideEmailPreview();
  }
}

function showEmailPreview(data) {
  elements.emailPreview.classList.remove("hidden");
  elements.emailSubject.textContent = data.subject
    ? `📌 ${data.subject}`
    : "Subject not detected";
  elements.emailSender.textContent = data.sender
    ? `From: ${data.sender}`
    : "";
  elements.emailSnippet.textContent = data.body
    ? data.body.slice(0, 120) + (data.body.length > 120 ? "…" : "")
    : "Body not detected";
}

function hideEmailPreview() {
  elements.emailPreview.classList.add("hidden");
}

function buildEmailInput(email) {
  const parts = [];
  if (email.subject) parts.push(`Subject: ${email.subject}`);
  if (email.sender) parts.push(`From: ${email.sender}`);
  if (email.body) parts.push(`Body: ${email.body}`);
  return parts.join("\n\n");
}

// ─── Storage ────────────────────────────────────────────

async function hydrateFromStorage() {
  try {
    const stored = await chrome.storage.local.get(STORAGE_KEY);
    if (stored[STORAGE_KEY]) {
      lastResult = stored[STORAGE_KEY];
      renderResult(lastResult);
      setStatus("Cached");
    }
  } catch {
    // Storage is optional for the core flow.
  }
}

// ─── Analysis ───────────────────────────────────────────

async function analyzeCurrentPage() {
  const now = Date.now();
  if (isLoading) {
    return;
  }

  if (now < cooldownUntil) {
    setMessage("Please wait a moment before scanning again.", "muted");
    return;
  }

  if (!activeTabUrl) {
    await loadActiveTab();
  }

  if (!activeTabUrl) {
    return;
  }

  setLoading(true);

  // Decide input based on mode
  let input;
  if (analysisMode === "email" && extractedEmail && (extractedEmail.subject || extractedEmail.body)) {
    input = buildEmailInput(extractedEmail).slice(0, MAX_INPUT_LENGTH);
    setMessage("Analyzing email content…", "muted");
  } else {
    input = activeTabUrl.slice(0, MAX_INPUT_LENGTH);
    setMessage(analysisMode === "email" ? "No email body found — analyzing URL…" : "Scanning website…", "muted");
  }

  try {
    const response = await fetch(ANALYZE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.error || "PhishGuard could not complete analysis.");
    }

    lastResult = {
      ...payload,
      input: analysisMode === "email" ? `[Email] ${extractedEmail?.subject || activeTabUrl}` : activeTabUrl,
      mode: analysisMode,
      analyzedAt: new Date().toISOString(),
    };

    await chrome.storage.local.set({ [STORAGE_KEY]: lastResult });
    renderResult(lastResult);
    setMessage(payload?.fallback ? FALLBACK_MESSAGE : "Scan complete.", payload?.fallback ? "muted" : "success");
  } catch (error) {
    console.error("PhishGuard extension analysis failed:", error);
    lastResult = getFallbackResult(activeTabUrl);
    await chrome.storage.local.set({ [STORAGE_KEY]: lastResult });
    renderResult(lastResult);
    setMessage(FALLBACK_MESSAGE, "error");
  } finally {
    setLoading(false);
    startCooldown();
  }
}

// ─── Fallback ───────────────────────────────────────────

function getFallbackResult(input) {
  return {
    riskLevel: "HIGH",
    score: 80,
    explanation:
      "This appears to be a phishing attempt due to suspicious patterns such as urgency and domain mismatch.",
    recommendedActions: [
      "Do not click any links",
      "Verify sender independently",
      "Report as phishing",
    ],
    input,
    analyzedAt: new Date().toISOString(),
    fallback: true,
  };
}

// ─── Render ─────────────────────────────────────────────

function renderResult(result) {
  const riskLevel = normalizeRiskLevel(result.riskLevel);
  const score = Number.isFinite(Number(result.score)) ? Math.round(Number(result.score)) : 0;

  elements.resultSection.classList.remove("hidden");
  elements.riskBadge.textContent = riskLevel;
  elements.riskBadge.className = `risk-badge ${riskLevel.toLowerCase()}`;
  elements.scoreValue.textContent = String(score);
  elements.explanation.textContent = result.explanation || "PhishGuard completed the analysis.";
  elements.actions.innerHTML = "";

  const actions = Array.isArray(result.recommendedActions) ? result.recommendedActions.slice(0, 3) : [];
  actions.forEach((action) => {
    const row = document.createElement("div");
    row.className = "action-row";
    row.textContent = action;
    elements.actions.appendChild(row);
  });

  elements.reportButton.classList.remove("hidden");
  setStatus(riskLevel);
}

function normalizeRiskLevel(riskLevel) {
  if (riskLevel === "HIGH" || riskLevel === "MEDIUM" || riskLevel === "SAFE") {
    return riskLevel;
  }

  return "MEDIUM";
}

// ─── UI Helpers ─────────────────────────────────────────

function setLoading(nextIsLoading) {
  isLoading = nextIsLoading;
  elements.analyzeButton.disabled = nextIsLoading || Date.now() < cooldownUntil;

  if (nextIsLoading) {
    elements.analyzeButton.textContent = analysisMode === "email" ? "Analyzing Email…" : "Scanning…";
    setStatus("Scanning");
  } else {
    elements.analyzeButton.textContent = analysisMode === "email" ? "Analyze Email" : "Analyze Current Page";
  }

  elements.statusPill.classList.toggle("scanning", nextIsLoading);
}

function startCooldown() {
  cooldownUntil = Date.now() + COOLDOWN_MS;
  elements.analyzeButton.disabled = true;
  elements.analyzeButton.textContent = "Cooling down...";
  window.setTimeout(() => {
    cooldownUntil = 0;
    elements.analyzeButton.disabled = false;
    elements.analyzeButton.textContent = analysisMode === "email" ? "Analyze Email" : "Analyze Current Page";
  }, COOLDOWN_MS);
}

function setStatus(status) {
  elements.statusPill.textContent = status;
}

function setMessage(message, tone = "muted") {
  elements.message.textContent = message;
  elements.message.className = `message ${tone}`;
}

function openFullReport() {
  const url = new URL(BASE_URL);
  url.searchParams.set("source", "extension");
  if (lastResult?.input) {
    url.searchParams.set("url", lastResult.input);
  }
  chrome.tabs.create({ url: url.toString() });
}

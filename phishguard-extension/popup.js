"use strict";

const BASE_URL = "http://localhost:3000";
const ANALYZE_ENDPOINT = `${BASE_URL}/api/analyze`;
const STORAGE_KEY = "phishguard_last_result";
const COOLDOWN_MS = 2500;
const MAX_INPUT_LENGTH = 2000;
const FALLBACK_MESSAGE = "⚠️ Using demo result due to API limits";

const elements = {
  analyzeButton: document.getElementById("analyzeButton"),
  reportButton: document.getElementById("reportButton"),
  currentUrl: document.getElementById("currentUrl"),
  statusPill: document.getElementById("statusPill"),
  resultSection: document.getElementById("resultSection"),
  riskBadge: document.getElementById("riskBadge"),
  scoreValue: document.getElementById("scoreValue"),
  explanation: document.getElementById("explanation"),
  actions: document.getElementById("actions"),
  message: document.getElementById("message"),
};

let activeTabUrl = "";
let lastResult = null;
let isLoading = false;
let cooldownUntil = 0;

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

async function loadActiveTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    activeTabUrl = tab?.url || "";

    if (!activeTabUrl) {
      setMessage("Unable to read the current tab URL.", "error");
      elements.currentUrl.textContent = "No active tab detected";
      return;
    }

    elements.currentUrl.textContent = activeTabUrl;
    elements.currentUrl.title = activeTabUrl;
  } catch (error) {
    setMessage("Chrome blocked access to the current tab.", "error");
    elements.currentUrl.textContent = "Unable to read current tab";
  }
}

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
  setMessage("Scanning...", "muted");

  try {
    const input = activeTabUrl.slice(0, MAX_INPUT_LENGTH);
    const response = await fetch(ANALYZE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.error || "PhishGuard could not analyze this page.");
    }

    lastResult = {
      ...payload,
      input: activeTabUrl,
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

function setLoading(nextIsLoading) {
  isLoading = nextIsLoading;
  elements.analyzeButton.disabled = nextIsLoading || Date.now() < cooldownUntil;
  elements.analyzeButton.textContent = nextIsLoading ? "Scanning..." : "Analyze Current Page";
  elements.statusPill.classList.toggle("scanning", nextIsLoading);
  if (nextIsLoading) {
    setStatus("Scanning");
  }
}

function startCooldown() {
  cooldownUntil = Date.now() + COOLDOWN_MS;
  elements.analyzeButton.disabled = true;
  elements.analyzeButton.textContent = "Cooling down...";
  window.setTimeout(() => {
    cooldownUntil = 0;
    elements.analyzeButton.disabled = false;
    elements.analyzeButton.textContent = "Analyze Current Page";
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

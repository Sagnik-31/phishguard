"use strict";

const ANALYZE_ENDPOINT = "http://localhost:3000/api/analyze";
const MAX_INPUT_LENGTH = 2000;
const CACHE_MAX_SIZE = 50;

/**
 * Simple in-memory cache to avoid re-analyzing the same email.
 * Keyed by a hash of the email content.
 */
const analysisCache = new Map();

/**
 * Fast, non-cryptographic string hash (djb2).
 */
function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return String(hash);
}

/**
 * Evicts the oldest entry when the cache exceeds the max size.
 */
function cacheSet(key, value) {
  if (analysisCache.size >= CACHE_MAX_SIZE) {
    const oldest = analysisCache.keys().next().value;
    analysisCache.delete(oldest);
  }
  analysisCache.set(key, value);
}

/**
 * Calls the PhishGuard API with the email content.
 */
async function analyzeEmail(payload) {
  const input = [
    payload.subject ? `Subject: ${payload.subject}` : "",
    payload.sender ? `From: ${payload.sender}` : "",
    "",
    payload.emailBody || "",
  ]
    .join("\n")
    .trim()
    .slice(0, MAX_INPUT_LENGTH);

  if (input.length < 10) {
    return { error: "Email content too short to analyze." };
  }

  const cacheKey = hashString(input);
  const cached = analysisCache.get(cacheKey);
  if (cached) {
    return { ...cached, cached: true };
  }

  try {
    const response = await fetch(ANALYZE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.error || "API returned an error.");
    }

    cacheSet(cacheKey, result);
    return result;
  } catch (error) {
    console.error("[PhishGuard BG] Analysis failed:", error);
    return getFallbackResult();
  }
}

function getFallbackResult() {
  return {
    riskLevel: "MEDIUM",
    score: 50,
    explanation:
      "PhishGuard could not reach the analysis server. Exercise caution with this email.",
    recommendedActions: [
      "Do not click any links until verified",
      "Verify sender independently",
      "Report suspicious emails to your IT team",
    ],
    fallback: true,
  };
}

/**
 * Listen for messages from content scripts.
 */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "OPEN_REPORT") {
    try {
      // Encode the analysis result as a base64 query param so the
      // dashboard can pick it up and display without re-analyzing.
      const encoded = btoa(
        unescape(encodeURIComponent(JSON.stringify(message.result || {})))
      );
      const url = `http://localhost:3000?source=extension-autoscan&pgdata=${encoded}`;
      chrome.tabs.create({ url });
    } catch {
      chrome.tabs.create({ url: "http://localhost:3000?source=extension-autoscan" });
    }
    return false;
  }

  if (message.type !== "ANALYZE_EMAIL") {
    return false;
  }

  analyzeEmail(message.payload)
    .then((result) => sendResponse({ success: true, result }))
    .catch((err) =>
      sendResponse({ success: false, error: err.message, result: getFallbackResult() })
    );

  // Return true to keep the message channel open for the async response.
  return true;
});

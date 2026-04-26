"use strict";

(() => {
  /* ── Constants ── */
  const BANNER_ID = "phishguard-banner";
  const DEBOUNCE_MS = 800;
  const BASE_URL = "http://localhost:3000";
  const MAX_EXTRACT_LENGTH = 2000;

  /* ── State ── */
  let lastContentHash = "";
  let debounceTimer = null;
  let observer = null;

  /* ── Provider detection ── */
  function getProvider() {
    const host = location.hostname;
    if (host === "mail.google.com") return "gmail";
    if (
      host === "outlook.live.com" ||
      host === "outlook.office.com" ||
      host === "outlook.office365.com"
    )
      return "outlook";
    return null;
  }

  /* ── Email extraction — Gmail ── */
  function extractGmail() {
    // Gmail email body container
    const bodyEl =
      document.querySelector(".a3s.aiL") ||
      document.querySelector('div[data-message-id] .a3s') ||
      document.querySelector('div.ii.gt div.a3s');

    if (!bodyEl) return null;

    // Subject
    const subjectEl =
      document.querySelector("h2.hP") ||
      document.querySelector('h2[data-thread-perm-id]');
    const subject = subjectEl ? subjectEl.textContent.trim() : "";

    // Sender
    const senderEl =
      document.querySelector("span.gD") ||
      document.querySelector('span[email]');
    const sender = senderEl
      ? (senderEl.getAttribute("email") || senderEl.textContent || "").trim()
      : "";

    const emailBody = bodyEl.innerText.trim();

    return { subject, sender, emailBody };
  }

  /* ── Email extraction — Outlook Web ── */
  function extractOutlook() {
    // Outlook reading pane body
    const bodyEl =
      document.querySelector('div[aria-label="Message body"]') ||
      document.querySelector('div[role="main"] div.ReadMsgBody') ||
      document.querySelector('div[role="main"] div[aria-label="Email message"]') ||
      document.querySelector('div[autoid="_n_1"]');

    if (!bodyEl) return null;

    // Subject
    const subjectEl =
      document.querySelector('span[id="ConversationReadingPaneSubject"]') ||
      document.querySelector('div[role="main"] span.allowTextSelection');
    const subject = subjectEl ? subjectEl.textContent.trim() : "";

    // Sender
    const senderEl =
      document.querySelector('span.lpc-hoverTarget span.OZZZK') ||
      document.querySelector('div[role="main"] span[autoid="_pe_b"]') ||
      document.querySelector('button[aria-label*="Profile picture"] + span');
    const sender = senderEl ? senderEl.textContent.trim() : "";

    const emailBody = bodyEl.innerText.trim();

    return { subject, sender, emailBody };
  }

  /* ── Unified extraction ── */
  function extractEmail() {
    const provider = getProvider();
    if (!provider) return null;

    const data = provider === "gmail" ? extractGmail() : extractOutlook();

    if (!data || !data.emailBody || data.emailBody.length < 10) return null;

    // Truncate to API limit
    data.emailBody = data.emailBody.slice(0, MAX_EXTRACT_LENGTH);
    return data;
  }

  /* ── Simple string hash (djb2) ── */
  function hashString(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
    }
    return String(hash);
  }

  /* ── Banner DOM ── */
  function removeBanner() {
    const existing = document.getElementById(BANNER_ID);
    if (existing) {
      existing.classList.add("pg-hiding");
      setTimeout(() => existing.remove(), 260);
    }
  }

  function createBanner() {
    removeBanner();

    const banner = document.createElement("div");
    banner.id = BANNER_ID;

    // Badge (scanning state)
    const badge = document.createElement("div");
    badge.id = "phishguard-badge";
    badge.className = "pg-scanning";
    badge.textContent = "PG";

    // Content area
    const content = document.createElement("div");
    content.id = "phishguard-content";

    const title = document.createElement("p");
    title.id = "phishguard-title";
    title.textContent = "PhishGuard — Scanning...";

    const detail = document.createElement("p");
    detail.id = "phishguard-detail";
    detail.textContent = "Analyzing email for phishing indicators";

    content.appendChild(title);
    content.appendChild(detail);

    // Dismiss button
    const dismiss = document.createElement("button");
    dismiss.id = "phishguard-dismiss";
    dismiss.textContent = "×";
    dismiss.title = "Dismiss";
    dismiss.addEventListener("click", (e) => {
      e.stopPropagation();
      removeBanner();
    });

    banner.appendChild(badge);
    banner.appendChild(content);
    banner.appendChild(dismiss);
    document.body.appendChild(banner);

    return banner;
  }

  /** Stores the latest analysis result so "Full Report" can forward it. */
  let latestResult = null;

  function updateBanner(result) {
    const banner = document.getElementById(BANNER_ID);
    if (!banner) return;

    latestResult = result;

    const risk = normalizeRisk(result.riskLevel);
    const score =
      Number.isFinite(Number(result.score)) ? Math.round(Number(result.score)) : 0;

    // Badge
    const badge = document.getElementById("phishguard-badge");
    badge.className = `pg-${risk}`;
    badge.textContent = risk === "safe" ? "✓" : risk === "high" ? "!!" : "!";

    // Title
    const title = document.getElementById("phishguard-title");
    const riskLabels = {
      safe: "✓ Email appears safe",
      medium: "⚠ Moderate risk detected",
      high: "🚨 High phishing risk",
    };
    title.textContent = riskLabels[risk] || riskLabels.medium;

    // Detail text
    const detail = document.getElementById("phishguard-detail");
    detail.textContent =
      result.explanation || "Analysis complete. See full report for details.";

    // Score chip
    const scoreChip = document.createElement("div");
    scoreChip.id = "phishguard-score-chip";
    scoreChip.className = `pg-${risk}`;

    const scoreNum = document.createElement("span");
    scoreNum.textContent = String(score);

    const scoreSuffix = document.createElement("span");
    scoreSuffix.id = "phishguard-score-suffix";
    scoreSuffix.textContent = "%";

    scoreChip.appendChild(scoreNum);
    scoreChip.appendChild(scoreSuffix);

    // Actions row
    const actions = document.createElement("div");
    actions.id = "phishguard-actions";

    const reportLink = document.createElement("a");
    reportLink.id = "phishguard-report-link";
    reportLink.textContent = "Full Report →";
    reportLink.href = "#";
    reportLink.addEventListener("click", (e) => {
      e.preventDefault();
      // Send the full result to the background worker so it can
      // open the dashboard with the analysis pre-loaded.
      chrome.runtime.sendMessage({
        type: "OPEN_REPORT",
        result: latestResult,
      });
    });

    actions.appendChild(reportLink);

    // Insert into content
    const content = document.getElementById("phishguard-content");
    content.appendChild(actions);

    // Insert score chip before dismiss
    const dismiss = document.getElementById("phishguard-dismiss");
    banner.insertBefore(scoreChip, dismiss);
  }

  function normalizeRisk(riskLevel) {
    if (riskLevel === "HIGH") return "high";
    if (riskLevel === "MEDIUM") return "medium";
    if (riskLevel === "SAFE") return "safe";
    return "medium";
  }

  /* ── Core scan flow ── */
  async function scanEmail() {
    const emailData = extractEmail();
    if (!emailData) return;

    const contentHash = hashString(
      emailData.subject + emailData.sender + emailData.emailBody
    );

    // Don't rescan the same email
    if (contentHash === lastContentHash) return;
    lastContentHash = contentHash;

    // Show scanning banner
    createBanner();

    try {
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { type: "ANALYZE_EMAIL", payload: emailData },
          (resp) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }
            resolve(resp);
          }
        );
      });

      if (response && response.result) {
        updateBanner(response.result);
      } else {
        removeBanner();
      }
    } catch (err) {
      console.error("[PhishGuard Content] Scan failed:", err);
      removeBanner();
    }
  }

  /* ── Debounced scan trigger ── */
  function debouncedScan() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(scanEmail, DEBOUNCE_MS);
  }

  /* ── MutationObserver — watch for email open ── */
  function startObserving() {
    const provider = getProvider();
    if (!provider) return;

    // Target the main content area
    const target = document.body;

    observer = new MutationObserver((mutations) => {
      // Look for meaningful DOM changes (new email rendered)
      const dominated = mutations.some(
        (m) =>
          m.addedNodes.length > 0 ||
          (m.type === "attributes" && m.attributeName === "class")
      );

      if (dominated) {
        debouncedScan();
      }
    });

    observer.observe(target, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "aria-label"],
    });

    // Also try an initial scan in case an email is already open
    setTimeout(scanEmail, 1200);
  }

  /* ── Handle report link opens (from background) ── */
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "OPEN_TAB" && message.url) {
      window.open(message.url, "_blank");
    }
  });

  /* ── Hashchange / popstate for SPA navigation ── */
  window.addEventListener("hashchange", debouncedScan);
  window.addEventListener("popstate", debouncedScan);

  /* ── Init ── */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startObserving);
  } else {
    startObserving();
  }
})();

"use strict";

/**
 * PhishGuard Content Script
 * Injected into webmail pages to extract email content from the DOM.
 * Returns structured email data: { subject, sender, body }
 */

(function extractEmail() {
  const url = window.location.href;

  // --- Gmail ---
  if (url.includes("mail.google.com")) {
    return extractGmail();
  }

  // --- Outlook Web ---
  if (url.includes("outlook.live.com") || url.includes("outlook.office.com")) {
    return extractOutlook();
  }

  // --- Yahoo Mail ---
  if (url.includes("mail.yahoo.com")) {
    return extractYahoo();
  }

  return { subject: null, sender: null, body: null };

  // ─── Extractors ───────────────────────────────────────

  function extractGmail() {
    // Subject: Gmail puts subject in <h2> with class "hP"
    const subjectEl =
      document.querySelector("h2.hP") ||
      document.querySelector("[data-thread-perm-id] h2") ||
      document.querySelector("h2[data-legacy-thread-id]");
    const subject = subjectEl?.textContent?.trim() || null;

    // Sender: The "From" field in the open email
    const senderEl =
      document.querySelector("span.gD") ||
      document.querySelector("[email]") ||
      document.querySelector(".go");
    const sender =
      senderEl?.getAttribute("email") ||
      senderEl?.getAttribute("data-hovercard-id") ||
      senderEl?.textContent?.trim() ||
      null;

    // Body: the visible email message body
    const bodyEl =
      document.querySelector("div.a3s.aiL") ||
      document.querySelector("div.a3s") ||
      document.querySelector("[data-message-id] div[dir]") ||
      document.querySelector(".ii.gt div");
    const body = bodyEl?.innerText?.trim() || null;

    return { subject, sender, body };
  }

  function extractOutlook() {
    const subjectEl =
      document.querySelector("[role='heading'][aria-level='2']") ||
      document.querySelector("span.rps_980e");
    const subject = subjectEl?.textContent?.trim() || null;

    const senderEl =
      document.querySelector("span.lDdSm") ||
      document.querySelector("[autoid='__header_fromName']") ||
      document.querySelector(".OZZZK");
    const sender = senderEl?.textContent?.trim() || null;

    const bodyEl =
      document.querySelector("[role='document']") ||
      document.querySelector("div[aria-label='Message body']") ||
      document.querySelector(".XbIp4.jmmB7");
    const body = bodyEl?.innerText?.trim() || null;

    return { subject, sender, body };
  }

  function extractYahoo() {
    const subjectEl =
      document.querySelector("[data-test-id='message-group-subject-text']") ||
      document.querySelector("span.y_V4");
    const subject = subjectEl?.textContent?.trim() || null;

    const senderEl =
      document.querySelector("[data-test-id='message-group-sender-name']") ||
      document.querySelector("span[data-testid='email-pill']");
    const sender = senderEl?.textContent?.trim() || null;

    const bodyEl =
      document.querySelector("[data-test-id='message-view-body-content']") ||
      document.querySelector("div.msg-body");
    const body = bodyEl?.innerText?.trim() || null;

    return { subject, sender, body };
  }
})();

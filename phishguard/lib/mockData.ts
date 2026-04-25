import type { AnalysisResult } from "./types";

export const mockHighRisk: AnalysisResult = {
  riskLevel: "HIGH",
  score: 91,
  findings: [
    {
      id: "7c30e4ee-a9fb-44df-802a-d8cf4d74e2d1",
      severity: "critical",
      category: "Typosquatting Domain",
      detail: "The message impersonates PayPal while linking to a domain using the digit 1 in place of the letter l.",
      snippet: "paypa1-security.com",
    },
    {
      id: "946dfe5e-bd72-4e54-8b43-0c8053e6c256",
      severity: "critical",
      category: "Credential Theft Request",
      detail: "The message asks the recipient to verify account credentials through an external login page.",
      snippet: "verify your password",
    },
    {
      id: "7d521326-f0d7-470e-8d2f-e3dcb8a240df",
      severity: "critical",
      category: "Urgency Language",
      detail: "The copy threatens account limitation within a short time window to pressure immediate action.",
      snippet: "within 24 hours",
    },
    {
      id: "dc118906-5a66-4698-823d-f2e96c05ae13",
      severity: "critical",
      category: "Sender Mismatch",
      detail: "The display name claims PayPal, but the sender domain is not owned by PayPal.",
      snippet: "support@paypa1-security.com",
    },
  ],
  extractedLinks: [
    {
      id: "62ab8f32-185c-4db7-9e10-7d06dfd2f7ff",
      original: "https://paypa1-security.com/login/verify",
      resolved: "https://paypa1-security.com/login/verify",
      riskLabel: "suspicious",
      reason: "The domain is a PayPal lookalike and hosts a credential verification path.",
    },
    {
      id: "e7ca10b4-9242-40a9-82fb-858c279efea2",
      original: "https://paypa1-security.com/account-review",
      resolved: "https://paypa1-security.com/account-review",
      riskLabel: "suspicious",
      reason: "The same lookalike domain is used for an account review lure.",
    },
  ],
  breakdown: [
    { label: "Urgency Language", score: 95, severity: "critical" },
    { label: "Domain Integrity", score: 96, severity: "critical" },
    { label: "Link Safety", score: 90, severity: "critical" },
    { label: "Sender Authenticity", score: 88, severity: "critical" },
    { label: "Content Deception", score: 86, severity: "critical" },
  ],
  explanation:
    "This email shows strong indicators of a phishing attack because it impersonates PayPal and sends the recipient to a lookalike domain. The urgent account limitation language and credential verification request are consistent with credential theft campaigns.",
  recommendedActions: [
    "Do not click any links in the message.",
    "Report the email to your security team or email provider.",
    "Visit PayPal by typing the official address directly in your browser.",
    "Reset your password from the official site if you already entered credentials.",
    "Delete the message after reporting it.",
  ],
  analyzedAt: "2026-04-25T09:02:00.000Z",
};

export const mockMediumRisk: AnalysisResult = {
  riskLevel: "MEDIUM",
  score: 48,
  findings: [
    {
      id: "598d5d42-75e7-4cf4-90d5-af5339f1b631",
      severity: "warning",
      category: "Tracking Redirect",
      detail: "The message uses marketing redirect links that obscure the destination before click-through.",
      snippet: "trk.mailroute.example",
    },
    {
      id: "a274c7a5-048d-4a78-aed0-c5a36d3426c9",
      severity: "warning",
      category: "Promotional Pressure",
      detail: "The offer uses time-limited language, though it does not request credentials or payment data.",
      snippet: "ends tonight",
    },
  ],
  extractedLinks: [
    {
      id: "2e81f1cd-cab9-472f-9c36-ec38c6bdd6b4",
      original: "https://trk.mailroute.example/c/82910/spring-offer",
      resolved: "https://store.example.com/spring-offer",
      riskLabel: "suspicious",
      reason: "The URL is a tracking redirect, but the resolved destination matches the sender brand.",
    },
  ],
  breakdown: [
    { label: "Urgency Language", score: 42, severity: "warning" },
    { label: "Domain Integrity", score: 35, severity: "warning" },
    { label: "Link Safety", score: 55, severity: "warning" },
    { label: "Sender Authenticity", score: 28, severity: "info" },
    { label: "Content Deception", score: 36, severity: "warning" },
  ],
  explanation:
    "This marketing email contains some risk because it relies on tracking redirects and time-limited promotional wording. No direct credential request or strong brand impersonation is present, so the overall risk remains medium.",
  recommendedActions: [
    "Hover over links before opening them.",
    "Open the sender website directly if you want to view the promotion.",
    "Avoid entering passwords through redirected links.",
  ],
  analyzedAt: "2026-04-25T09:05:00.000Z",
};

export const mockSafeResult: AnalysisResult = {
  riskLevel: "SAFE",
  score: 12,
  findings: [
    {
      id: "63e8f384-0cd1-4e80-9f7e-3417c56905bd",
      severity: "info",
      category: "Known Sender",
      detail: "The notification references a Google domain and does not ask for credentials or sensitive data.",
      snippet: "accounts.google.com",
    },
  ],
  extractedLinks: [
    {
      id: "9abcbab0-38f4-4a73-9190-5f7288c7a5fc",
      original: "https://accounts.google.com/AccountChooser",
      resolved: "https://accounts.google.com/AccountChooser",
      riskLabel: "safe",
      reason: "The destination is a recognized Google account domain.",
    },
  ],
  breakdown: [
    { label: "Urgency Language", score: 8, severity: "safe" },
    { label: "Domain Integrity", score: 6, severity: "safe" },
    { label: "Link Safety", score: 14, severity: "safe" },
    { label: "Sender Authenticity", score: 12, severity: "safe" },
    { label: "Content Deception", score: 10, severity: "safe" },
  ],
  explanation:
    "This appears to be a legitimate Google notification with a recognized Google destination and low-pressure language. The message does not request passwords, payment details, or one-time passcodes.",
  recommendedActions: [
    "Open Google services from your normal bookmark when in doubt.",
    "Confirm the notification in your Google account activity page.",
    "Keep multi-factor authentication enabled.",
  ],
  analyzedAt: "2026-04-25T09:08:00.000Z",
};

export const mockHRSpoof: AnalysisResult = {
  riskLevel: "HIGH",
  score: 78,
  findings: [
    {
      id: "2ef567e2-4887-41f5-b482-b9eda17b146f",
      severity: "critical",
      category: "Internal Impersonation",
      detail: "The email claims to be from HR but uses a domain that differs from the legitimate company domain.",
      snippet: "hr-payroll@acme-benefits.co",
    },
    {
      id: "cd879d4f-edcf-42be-8168-d9bc1f3b0f4d",
      severity: "critical",
      category: "Sensitive Data Request",
      detail: "The message asks employees to update payroll and tax information through an external form.",
      snippet: "direct deposit and tax withholding",
    },
    {
      id: "5a8d85a9-8cb5-492f-99db-a3a535ddbc63",
      severity: "critical",
      category: "Deadline Pressure",
      detail: "The email threatens delayed salary processing unless the recipient acts quickly.",
      snippet: "before 5 PM today",
    },
  ],
  extractedLinks: [
    {
      id: "363ad731-936a-4db9-9fce-764b2cf82bb8",
      original: "https://acme-benefits.co/payroll/update",
      resolved: "https://acme-benefits.co/payroll/update",
      riskLabel: "malicious",
      reason: "The destination is an external HR-themed domain collecting sensitive payroll details.",
    },
  ],
  breakdown: [
    { label: "Urgency Language", score: 82, severity: "critical" },
    { label: "Domain Integrity", score: 76, severity: "critical" },
    { label: "Link Safety", score: 78, severity: "critical" },
    { label: "Sender Authenticity", score: 84, severity: "critical" },
    { label: "Content Deception", score: 72, severity: "critical" },
  ],
  explanation:
    "This message is high risk because it impersonates internal HR and asks for payroll details through an external domain. The deadline pressure is designed to rush employees into sharing sensitive financial information.",
  recommendedActions: [
    "Do not submit payroll or tax information through the link.",
    "Verify the request with HR through an internal channel.",
    "Forward the message to security for investigation.",
    "Block the sender if confirmed malicious.",
  ],
  analyzedAt: "2026-04-25T09:12:00.000Z",
};

export const mockShortURL: AnalysisResult = {
  riskLevel: "HIGH",
  score: 85,
  findings: [
    {
      id: "e68c72c4-193f-41d0-9c69-71609f0fe0f5",
      severity: "critical",
      category: "Shortened URLs",
      detail: "The email contains multiple shortened links that hide the final destination from the recipient.",
      snippet: "bit.ly",
    },
    {
      id: "d1e106e6-94d2-4c02-8cb1-f11e89ac6491",
      severity: "critical",
      category: "Suspicious Resolutions",
      detail: "The shortened links resolve to unrelated domains that mimic file sharing and identity pages.",
      snippet: "secure-docs-login.net",
    },
    {
      id: "d4f579ed-2ac5-4b54-aa4b-3e9defe67e70",
      severity: "warning",
      category: "Generic Lure",
      detail: "The message uses vague language about shared documents without identifying the sender or file context.",
      snippet: "important secure files",
    },
  ],
  extractedLinks: [
    {
      id: "629cf36d-24ac-4067-9c98-ec8a98b81b59",
      original: "https://bit.ly/secure-docs-182",
      resolved: "https://secure-docs-login.net/session",
      riskLabel: "malicious",
      reason: "The shortened URL resolves to a suspicious login-themed domain.",
    },
    {
      id: "880093a8-3b19-4525-bf1e-77b2f82cce65",
      original: "https://bit.ly/file-review-77",
      resolved: "https://drive-share-review.co/view",
      riskLabel: "suspicious",
      reason: "The destination resembles a document sharing service but is not a known provider domain.",
    },
    {
      id: "e4b6b9bc-f70a-4588-98d9-a33f5f553068",
      original: "https://bit.ly/identity-check-2026",
      resolved: "https://account-identity-verify.info",
      riskLabel: "malicious",
      reason: "The resolved domain is identity themed and unrelated to the sender.",
    },
  ],
  breakdown: [
    { label: "Urgency Language", score: 64, severity: "warning" },
    { label: "Domain Integrity", score: 88, severity: "critical" },
    { label: "Link Safety", score: 94, severity: "critical" },
    { label: "Sender Authenticity", score: 76, severity: "critical" },
    { label: "Content Deception", score: 82, severity: "critical" },
  ],
  explanation:
    "This email is high risk because it uses several shortened URLs that resolve to suspicious domains unrelated to the message context. The vague document sharing language and hidden destinations are common phishing tactics.",
  recommendedActions: [
    "Do not open the shortened links.",
    "Ask the sender to resend the files through an approved channel.",
    "Report the message as phishing.",
    "Block the resolved domains at the gateway if confirmed malicious.",
  ],
  analyzedAt: "2026-04-25T09:16:00.000Z",
};

export const mockResults: AnalysisResult[] = [
  mockHighRisk,
  mockMediumRisk,
  mockSafeResult,
  mockHRSpoof,
  mockShortURL,
];

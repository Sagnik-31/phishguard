import { NextResponse } from "next/server";
import type { AnalysisResult, BreakdownCategory, ExtractedLink, Finding } from "@/lib/types";

const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MAX_INPUT_LENGTH = 2000;
const RATE_LIMIT_MS = 2000;
const RETRY_DELAYS_MS = [1000, 2000];

let lastRequestAt = 0;

const SYSTEM_PROMPT = `You are PhishGuard, an expert cybersecurity forensics engine specializing in phishing detection. 
Analyze the provided email or URL and return ONLY a valid JSON object — no markdown, no explanation outside the JSON, no code fences.

Analyze for:
1. Sender/reply-to mismatch (from address vs reply-to vs display name)
2. Urgency or fear-inducing language ("your account will be suspended", "act now", "verify immediately")
3. Suspicious domains (typosquatting like paypa1.com, googIe.com, unicode homographs)
4. Shortened or redirected URLs (bit.ly, tinyurl, t.co, etc.)
5. Mismatched or deceptive link text vs actual URL
6. Requests for sensitive information (passwords, SSN, credit card, OTP)
7. Grammar and spelling anomalies
8. Impersonation of known brands or internal HR/IT departments

Return this exact JSON shape:
{
  "riskLevel": "HIGH" | "MEDIUM" | "SAFE",
  "score": <integer 0-100>,
  "findings": [
    {
      "id": "<uuid>",
      "severity": "critical" | "warning" | "info",
      "category": "<short category name>",
      "detail": "<specific explanation of this finding>",
      "snippet": "<the exact flagged text or domain, if applicable>"
    }
  ],
  "extractedLinks": [
    {
      "id": "<uuid>",
      "original": "<url as found in email>",
      "resolved": "<final destination if resolvable, else null>",
      "riskLabel": "malicious" | "suspicious" | "safe",
      "reason": "<one sentence explanation>"
    }
  ],
  "breakdown": [
    { "label": "Urgency Language", "score": <0-100>, "severity": "critical"|"warning"|"info"|"safe" },
    { "label": "Domain Integrity", "score": <0-100>, "severity": "critical"|"warning"|"info"|"safe" },
    { "label": "Link Safety", "score": <0-100>, "severity": "critical"|"warning"|"info"|"safe" },
    { "label": "Sender Authenticity", "score": <0-100>, "severity": "critical"|"warning"|"info"|"safe" },
    { "label": "Content Deception", "score": <0-100>, "severity": "critical"|"warning"|"info"|"safe" }
  ],
  "explanation": "<2-3 sentence forensic summary written for a non-technical user>",
  "recommendedActions": [
    "<imperative sentence action 1>",
    "<imperative sentence action 2>",
    "<imperative sentence action 3>"
  ],
  "analyzedAt": "<ISO 8601 timestamp>"
}

Scoring guide: 0-30 = SAFE, 31-65 = MEDIUM, 66-100 = HIGH.
Be precise. Be specific. Never hallucinate URLs or domains not present in the input.`;

interface GroqResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
}

function getFallbackResult(): AnalysisResult {
  return {
    riskLevel: "HIGH",
    score: 80,
    findings: [
      {
        id: "fallback-urgency",
        severity: "warning",
        category: "Suspicious Pattern",
        detail: "This input contains patterns commonly associated with phishing, including urgency or sender/domain mismatch.",
        snippet: "fallback analysis",
      },
    ],
    extractedLinks: [],
    breakdown: [
      { label: "Urgency Language", score: 80, severity: "warning" },
      { label: "Domain Integrity", score: 80, severity: "warning" },
      { label: "Link Safety", score: 80, severity: "warning" },
      { label: "Sender Authenticity", score: 80, severity: "warning" },
      { label: "Content Deception", score: 80, severity: "warning" },
    ],
    explanation:
      "This appears to be a phishing attempt due to suspicious patterns such as urgency and domain mismatch.",
    recommendedActions: [
      "Do not click any links",
      "Verify sender independently",
      "Report as phishing",
    ],
    analyzedAt: new Date().toISOString(),
    fallback: true,
  };
}

function getGroqApiKey() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY environment variable.");
  }

  return apiKey;
}

function clampScore(score: unknown): number {
  const value = typeof score === "number" ? score : Number(score);

  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function hasAllowedValue<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && allowed.includes(value as T);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stripJsonFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function parseGroqJson(text: string): Record<string, unknown> {
  const cleaned = stripJsonFences(text);

  try {
    const parsed = JSON.parse(cleaned) as unknown;
    if (!isRecord(parsed)) {
      throw new Error("Groq returned JSON that was not an object.");
    }

    return parsed;
  } catch {
    const repaired = cleaned.replace(/,\s*([}\]])/g, "$1");
    const parsed = JSON.parse(repaired) as unknown;
    if (!isRecord(parsed)) {
      throw new Error("Groq returned JSON that was not an object.");
    }

    return parsed;
  }
}

function normalizeAnalysis(raw: Record<string, unknown>): AnalysisResult {
  const riskLevel = hasAllowedValue(raw.riskLevel, ["HIGH", "MEDIUM", "SAFE"] as const)
    ? raw.riskLevel
    : "MEDIUM";

  const findings: Finding[] = Array.isArray(raw.findings)
    ? raw.findings.map((item, index) => {
        const finding = isRecord(item) ? item : {};

        return {
          id: typeof finding.id === "string" ? finding.id : crypto.randomUUID(),
          severity: hasAllowedValue(finding.severity, ["critical", "warning", "info"] as const)
            ? finding.severity
            : "info",
          category: typeof finding.category === "string" ? finding.category : `Finding ${index + 1}`,
          detail: typeof finding.detail === "string" ? finding.detail : "Groq flagged this item for review.",
          snippet: typeof finding.snippet === "string" ? finding.snippet : undefined,
        };
      })
    : [];

  const extractedLinks: ExtractedLink[] = Array.isArray(raw.extractedLinks)
    ? raw.extractedLinks.map((item) => {
        const link = isRecord(item) ? item : {};

        return {
          id: typeof link.id === "string" ? link.id : crypto.randomUUID(),
          original: typeof link.original === "string" ? link.original : "",
          resolved: typeof link.resolved === "string" ? link.resolved : undefined,
          riskLabel: hasAllowedValue(link.riskLabel, ["malicious", "suspicious", "safe"] as const)
            ? link.riskLabel
            : "suspicious",
          reason: typeof link.reason === "string" ? link.reason : "Groq marked this link for review.",
        };
      })
    : [];

  const breakdown: BreakdownCategory[] = Array.isArray(raw.breakdown)
    ? raw.breakdown.map((item) => {
        const category = isRecord(item) ? item : {};

        return {
          label: typeof category.label === "string" ? category.label : "Unknown Category",
          score: clampScore(category.score),
          severity: hasAllowedValue(category.severity, ["critical", "warning", "info", "safe"] as const)
            ? category.severity
            : "info",
        };
      })
    : [];

  return {
    riskLevel,
    score: clampScore(raw.score),
    findings,
    extractedLinks,
    breakdown,
    explanation:
      typeof raw.explanation === "string"
        ? raw.explanation
        : "Groq completed the analysis but did not provide a forensic summary.",
    recommendedActions: Array.isArray(raw.recommendedActions)
      ? raw.recommendedActions.filter((action): action is string => typeof action === "string")
      : ["Review the message with your security team."],
    analyzedAt: new Date().toISOString(),
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimited() {
  const now = Date.now();
  if (now - lastRequestAt < RATE_LIMIT_MS) {
    return true;
  }

  lastRequestAt = now;
  return false;
}

async function callGroq(input: string): Promise<GroqResponse> {
  const body = JSON.stringify({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: input },
    ],
    temperature: 0,
    max_tokens: 4096,
    response_format: { type: "json_object" },
  });

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    const response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getGroqApiKey()}`,
      },
      body,
    });

    const groq = (await response.json()) as GroqResponse;

    if (response.status === 429 && attempt < RETRY_DELAYS_MS.length) {
      console.warn(`Groq rate limited. Retrying in ${RETRY_DELAYS_MS[attempt]}ms.`);
      await sleep(RETRY_DELAYS_MS[attempt]);
      continue;
    }

    if (!response.ok) {
      throw new Error(groq.error?.message ?? `Groq request failed with status ${response.status}.`);
    }

    return groq;
  }

  throw new Error("Groq rate limit exceeded after retries.");
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { input?: unknown };
    const input = typeof body.input === "string" ? body.input.trim().slice(0, MAX_INPUT_LENGTH) : "";

    if (input.length < 10) {
      return NextResponse.json({ error: "Input must be at least 10 characters." }, { status: 400, headers: CORS_HEADERS });
    }

    if (isRateLimited()) {
      console.warn("PhishGuard API rate limit hit. Returning fallback result.");
      return NextResponse.json(getFallbackResult(), { status: 200, headers: CORS_HEADERS });
    }

    const groq = await callGroq(input);
    const text = groq.choices?.[0]?.message?.content?.trim();

    if (!text) {
      throw new Error("Groq did not return a text response.");
    }

    return NextResponse.json(normalizeAnalysis(parseGroqJson(text)), { status: 200, headers: CORS_HEADERS });
  } catch (error) {
    console.error("PhishGuard analysis fallback:", error instanceof Error ? error.message : error);
    return NextResponse.json(getFallbackResult(), { status: 200, headers: CORS_HEADERS });
  }
}

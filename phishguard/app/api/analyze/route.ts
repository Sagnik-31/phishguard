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

async function callGroq(input: string, debug: Record<string, unknown>): Promise<GroqResponse> {
  const apiKey = process.env.GROQ_API_KEY;
  debug.apiKeyExists = !!apiKey;
  debug.apiKeyLength = apiKey?.length ?? 0;
  debug.apiKeyPrefix = apiKey?.slice(0, 7) ?? "MISSING";
  console.log("[DEBUG] GROQ_API_KEY exists:", !!apiKey, "| length:", apiKey?.length ?? 0);

  const payload = {
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: input },
    ],
    temperature: 0,
    max_tokens: 4096,
    response_format: { type: "json_object" },
  };

  debug.requestModel = GROQ_MODEL;
  debug.requestEndpoint = GROQ_ENDPOINT;
  console.log("[DEBUG] Groq request model:", GROQ_MODEL);

  const body = JSON.stringify(payload);

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    console.log(`[DEBUG] Groq attempt ${attempt + 1}/${RETRY_DELAYS_MS.length + 1}`);

    const response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getGroqApiKey()}`,
      },
      body,
    });

    debug.httpStatus = response.status;
    debug.httpStatusText = response.statusText;
    console.log("[DEBUG] Groq HTTP status:", response.status, response.statusText);

    const rawText = await response.text();
    debug.rawResponseLength = rawText.length;
    debug.rawResponsePreview = rawText.slice(0, 500);
    console.log("[DEBUG] Groq raw response (first 500 chars):", rawText.slice(0, 500));

    let groq: GroqResponse;
    try {
      groq = JSON.parse(rawText) as GroqResponse;
    } catch (parseErr) {
      debug.groqJsonParseError = parseErr instanceof Error ? parseErr.message : String(parseErr);
      console.error("[DEBUG] Failed to parse Groq response as JSON:", parseErr);
      throw new Error(`Groq returned non-JSON response (status ${response.status}): ${rawText.slice(0, 200)}`);
    }

    if (response.status === 429 && attempt < RETRY_DELAYS_MS.length) {
      const retryMsg = groq.error?.message ?? "rate limited";
      debug.rateLimitMessage = retryMsg;
      console.warn(`[DEBUG] Groq rate limited (attempt ${attempt + 1}): ${retryMsg}. Retrying in ${RETRY_DELAYS_MS[attempt]}ms.`);
      await sleep(RETRY_DELAYS_MS[attempt]);
      continue;
    }

    if (!response.ok) {
      const errorMsg = groq.error?.message ?? `Groq request failed with status ${response.status}.`;
      debug.groqError = errorMsg;
      console.error("[DEBUG] Groq API error:", errorMsg);
      throw new Error(errorMsg);
    }

    debug.groqSuccess = true;
    debug.choicesCount = groq.choices?.length ?? 0;
    debug.contentLength = groq.choices?.[0]?.message?.content?.length ?? 0;
    console.log("[DEBUG] Groq success. Choices:", groq.choices?.length ?? 0, "| Content length:", groq.choices?.[0]?.message?.content?.length ?? 0);

    return groq;
  }

  debug.exhaustedRetries = true;
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
  const debug: Record<string, unknown> = { timestamp: new Date().toISOString() };

  try {
    const body = (await request.json()) as { input?: unknown };
    const input = typeof body.input === "string" ? body.input.trim().slice(0, MAX_INPUT_LENGTH) : "";

    debug.inputLength = input.length;
    debug.inputPreview = input.slice(0, 100);
    console.log("[DEBUG] POST /api/analyze | input length:", input.length, "| preview:", input.slice(0, 100));

    if (input.length < 10) {
      debug.rejected = "input too short";
      return NextResponse.json({ error: "Input must be at least 10 characters.", debug }, { status: 400, headers: CORS_HEADERS });
    }

    if (isRateLimited()) {
      debug.rejected = "internal rate limit";
      console.warn("[DEBUG] Internal rate limit hit.");
      return NextResponse.json({ ...getFallbackResult(), debug }, { status: 200, headers: CORS_HEADERS });
    }

    const groq = await callGroq(input, debug);
    const text = groq.choices?.[0]?.message?.content?.trim();

    debug.extractedTextLength = text?.length ?? 0;
    debug.extractedTextPreview = text?.slice(0, 300) ?? "EMPTY";
    console.log("[DEBUG] Extracted text (first 300 chars):", text?.slice(0, 300) ?? "EMPTY");

    if (!text) {
      debug.failReason = "empty text response";
      throw new Error("Groq did not return a text response.");
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = parseGroqJson(text);
      debug.jsonParseSuccess = true;
      debug.parsedKeys = Object.keys(parsed);
      console.log("[DEBUG] JSON parse success. Keys:", Object.keys(parsed));
    } catch (parseError) {
      debug.jsonParseSuccess = false;
      debug.jsonParseError = parseError instanceof Error ? parseError.message : String(parseError);
      debug.rawTextForParsing = text.slice(0, 500);
      console.error("[DEBUG] JSON parse FAILED:", parseError);
      throw parseError;
    }

    const result = normalizeAnalysis(parsed);
    debug.finalRiskLevel = result.riskLevel;
    debug.finalScore = result.score;
    console.log("[DEBUG] Final result: riskLevel=", result.riskLevel, "score=", result.score);

    return NextResponse.json({ ...result, debug }, { status: 200, headers: CORS_HEADERS });
  } catch (error) {
    debug.error = error instanceof Error ? error.message : String(error);
    debug.stack = error instanceof Error ? error.stack : undefined;
    console.error("[DEBUG] ERROR:", error instanceof Error ? error.message : error);
    console.error("[DEBUG] STACK:", error instanceof Error ? error.stack : "N/A");
    return NextResponse.json({ ...getFallbackResult(), debug }, { status: 200, headers: CORS_HEADERS });
  }
}

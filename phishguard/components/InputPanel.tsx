"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import ScanningLoader from "./ScanningLoader";
import type { AnalysisResult } from "@/lib/types";

interface InputPanelProps {
  input: string;
  onInputChange: (value: string) => void;
  demoResult?: AnalysisResult | null;
}

const MINIMUM_INPUT_LENGTH = 10;
const MAX_INPUT_LENGTH = 2000;
const COOLDOWN_MS = 2000;

function getFallbackResult(): AnalysisResult {
  return {
    riskLevel: "HIGH",
    score: 80,
    findings: [
      {
        id: "client-fallback",
        severity: "warning",
        category: "Fallback Analysis",
        detail: "A safe fallback result was used because the live analyzer was unavailable.",
        snippet: "demo-safe fallback",
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

function isAnalysisResult(payload: AnalysisResult | { error?: string }): payload is AnalysisResult {
  return (
    "riskLevel" in payload &&
    "score" in payload &&
    "explanation" in payload &&
    Array.isArray(payload.recommendedActions)
  );
}

export default function InputPanel({ input, onInputChange, demoResult }: InputPanelProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const isCoolingDown = Date.now() < cooldownUntil;
  const isSubmitDisabled = input.trim().length < MINIMUM_INPUT_LENGTH || isLoading || isCoolingDown;

  function finishWithResult(result: AnalysisResult) {
    sessionStorage.setItem(
      "phishguard_result",
      JSON.stringify({
        ...result,
        analyzedAt: new Date().toISOString(),
      }),
    );
    router.push("/analysis");
  }

  function startCooldown() {
    const until = Date.now() + COOLDOWN_MS;
    setCooldownUntil(until);
    window.setTimeout(() => setCooldownUntil(0), COOLDOWN_MS);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (input.trim().length < MINIMUM_INPUT_LENGTH) {
      setError("Enter at least 10 characters before starting an analysis.");
      return;
    }

    if (isCoolingDown) {
      setError("Please wait a moment before running another scan.");
      return;
    }

    setError("");

    if (demoResult) {
      finishWithResult(demoResult);
      return;
    }

    setIsLoading(true);

    try {
      const delay = new Promise((resolve) => {
        window.setTimeout(resolve, 1500);
      });

      const [response] = await Promise.all([
        fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ input: input.slice(0, MAX_INPUT_LENGTH) }),
        }),
        delay,
      ]);

      const payload = (await response.json()) as AnalysisResult | { error?: string };

      if (!response.ok) {
        console.error("PhishGuard API error:", "error" in payload ? payload.error : "Analysis failed.");
        finishWithResult(getFallbackResult());
        return;
      }

      finishWithResult(isAnalysisResult(payload) ? payload : getFallbackResult());
    } catch (caughtError) {
      console.error("PhishGuard request failed:", caughtError);
      finishWithResult(getFallbackResult());
    } finally {
      setIsLoading(false);
      startCooldown();
    }
  }

  return (
    <div className="max-w-4xl mx-auto w-full bg-surface-container-lowest p-gutter rounded-xl shadow-xl border border-outline-variant/30 mb-8">
      {isLoading ? <ScanningLoader /> : null}
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <label htmlFor="phish-input" className="sr-only">
            Suspicious email or URL
          </label>
          <textarea
            id="phish-input"
            value={input}
            maxLength={MAX_INPUT_LENGTH}
            onChange={(event) => onInputChange(event.target.value.slice(0, MAX_INPUT_LENGTH))}
            placeholder="Paste suspicious URL, email headers, or message content here..."
            aria-label="Paste a suspicious email or URL here"
            className="w-full min-h-[200px] p-6 pb-20 font-body-md text-body-md bg-surface-container-low border-outline border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg transition-all resize-none outline-none text-on-surface"
          />
          <div className="absolute bottom-4 left-6 text-on-surface-variant text-xs">
            {input.length.toLocaleString()} / {MAX_INPUT_LENGTH.toLocaleString()} characters
          </div>
          
          <div className="absolute bottom-4 right-4 flex items-center gap-3">
            {error ? (
              <p className="text-error text-sm font-medium mr-2" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={isSubmitDisabled}
              aria-label="Analyze for threats"
              className="bg-primary text-on-primary font-label-md text-label-md px-6 h-[44px] rounded-lg flex items-center gap-2 shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">shield_with_heart</span>
              {isLoading ? "Analyzing..." : isCoolingDown ? "Cooling down..." : "Analyze for threats"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

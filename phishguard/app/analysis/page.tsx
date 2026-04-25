"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AIExplanation from "@/components/AIExplanation";
import ExtractedLinks from "@/components/ExtractedLinks";
import FindingsCard from "@/components/FindingsCard";
import Header from "@/components/Header";
import RecommendedActions from "@/components/RecommendedActions";
import RiskBreakdown from "@/components/RiskBreakdown";
import RiskScoreBanner from "@/components/RiskScoreBanner";
import type { AnalysisResult } from "@/lib/types";

export default function AnalysisPage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("phishguard_result");

    if (!stored) {
      router.replace("/");
      return;
    }

    try {
      setResult(JSON.parse(stored) as AnalysisResult);
      setLoaded(true);
    } catch {
      sessionStorage.removeItem("phishguard_result");
      router.replace("/");
    }
  }, [router]);

  function analyzeAnother() {
    sessionStorage.removeItem("phishguard_result");
    router.push("/");
  }

  if (!loaded || !result) {
    return <main className="min-h-screen bg-gray-950" aria-label="Loading analysis" />;
  }

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-100">Threat analysis</h1>
            <p className="mt-1 text-sm text-gray-500">Forensic summary and recommended next steps</p>
          </div>
          <button
            type="button"
            onClick={analyzeAnother}
            aria-label="Analyze another email or URL"
            className="border border-gray-700 hover:border-gray-600 text-gray-300 px-4 py-2 rounded-lg transition-colors"
          >
            Analyze another
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <RiskScoreBanner result={result} />
            <FindingsCard findings={result.findings} />
            <ExtractedLinks links={result.extractedLinks} />
          </div>
          <div className="flex flex-col gap-6 lg:col-span-1">
            <RiskBreakdown breakdown={result.breakdown} />
            <AIExplanation result={result} />
            <RecommendedActions actions={result.recommendedActions} />
          </div>
        </div>
      </div>
    </main>
  );
}

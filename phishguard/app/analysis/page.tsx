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
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-10 w-full">
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-h1 text-h1 text-on-surface mb-2">Threat analysis</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Forensic summary for investigation #PG-8821. Detailed inspection of incoming communication payload, metadata, and embedded redirects.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-full text-label-md font-label-md">
              <span className="material-symbols-outlined text-outline" aria-hidden="true">calendar_today</span>
              {new Date(result.analyzedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={analyzeAnother}
              className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary rounded-full text-label-md font-label-md transition-all"
            >
              Analyze another
            </button>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          <RiskScoreBanner result={result} />
          <AIExplanation result={result} />
          
          <div className="md:col-span-3 space-y-gutter">
            <RiskBreakdown breakdown={result.breakdown} />
            <RecommendedActions actions={result.recommendedActions} />
          </div>
          
          <div className="md:col-span-9 space-y-gutter">
            <FindingsCard findings={result.findings} />
            <ExtractedLinks links={result.extractedLinks} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 mt-20">
        <div className="py-12 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 font-['Inter'] text-sm">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <div className="text-lg font-bold text-slate-900">PhishGuard</div>
            <p className="text-slate-500">© 2024 PhishGuard Intelligence. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a className="text-slate-500 hover:text-slate-900 transition-colors duration-200" href="#">Privacy Policy</a>
            <a className="text-slate-500 hover:text-slate-900 transition-colors duration-200" href="#">Terms of Service</a>
            <a className="text-slate-500 hover:text-slate-900 transition-colors duration-200" href="#">Security Disclosure</a>
            <a className="text-slate-500 hover:text-slate-900 transition-colors duration-200" href="#">Contact Support</a>
          </div>
        </div>
      </footer>
    </>
  );
}

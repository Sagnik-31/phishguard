"use client";

import { useEffect, useState } from "react";
import type { AnalysisResult } from "@/lib/types";
import { getRiskBannerClasses, getRiskColor } from "@/lib/utils";

interface RiskScoreBannerProps {
  result: AnalysisResult;
}

function getVerdict(riskLevel: AnalysisResult["riskLevel"]): string {
  if (riskLevel === "HIGH") {
    return "This email shows strong indicators of a phishing attack";
  }

  if (riskLevel === "MEDIUM") {
    return "This input contains suspicious signals that deserve review";
  }

  return "This input appears low risk based on the detected signals";
}

export default function RiskScoreBanner({ result }: RiskScoreBannerProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const riskColor = getRiskColor(result.riskLevel);

  useEffect(() => {
    let frame = 0;
    let start: number | null = null;
    const duration = 1200;

    function tick(timestamp: number) {
      if (start === null) {
        start = timestamp;
      }

      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplayScore(Math.round(result.score * progress));

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    }

    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [result.score]);

  return (
    <section
      className={`bg-white border border-slate-200 shadow-sm rounded-2xl p-6 ${getRiskBannerClasses(result.riskLevel)}`}
      aria-label={`Risk score ${result.score} out of 100, ${result.riskLevel}`}
    >
      <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-3">
        <div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Risk level
          </p>
          <p className={`mt-2 text-4xl font-bold ${riskColor}`}>{result.riskLevel}</p>
        </div>

        <div className="text-left md:text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Score
          </p>
          <p className="mt-2 text-7xl font-bold text-slate-900">
            {displayScore}
            <span className="text-2xl text-slate-400">/100</span>
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Verdict
          </p>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed font-medium">{getVerdict(result.riskLevel)}</p>
        </div>
      </div>
    </section>
  );
}

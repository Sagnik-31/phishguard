"use client";

import { useEffect, useState } from "react";
import type { AnalysisResult } from "@/lib/types";

interface RiskScoreBannerProps {
  result: AnalysisResult;
}

function getVerdict(riskLevel: AnalysisResult["riskLevel"]): string {
  if (riskLevel === "HIGH") {
    return "This email shows strong indicators of a phishing attack. Do not engage.";
  }

  if (riskLevel === "MEDIUM") {
    return "This communication contains elements typical of marketing pressure but exhibits suspicious redirection patterns. Proceed with caution.";
  }

  return "This input appears low risk based on the detected signals. Safe to proceed.";
}

function getRiskColorConfig(riskLevel: string) {
  if (riskLevel === "HIGH") {
    return {
      text: "text-error",
      bgShape: "bg-error/10",
      pillBg: "bg-error-container",
      pillText: "text-on-error-container",
      icon: "dangerous"
    };
  }
  if (riskLevel === "MEDIUM") {
    return {
      text: "text-tertiary",
      bgShape: "bg-tertiary/10",
      pillBg: "bg-tertiary-fixed",
      pillText: "text-on-tertiary-fixed",
      icon: "warning"
    };
  }
  return {
    text: "text-primary",
    bgShape: "bg-primary/10",
    pillBg: "bg-primary-fixed",
    pillText: "text-on-primary-fixed",
    icon: "check_circle"
  };
}

export default function RiskScoreBanner({ result }: RiskScoreBannerProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const config = getRiskColorConfig(result.riskLevel);

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
    <div className="md:col-span-4 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-md flex flex-col justify-between overflow-hidden relative">
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 ${config.bgShape}`}></div>
      <div>
        <h3 className="font-label-md text-label-md text-on-surface-variant uppercase mb-4">Risk Level</h3>
        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-[56px] font-bold leading-none ${config.text}`}>{displayScore}</span>
          <span className="text-h3 font-h3 text-outline">/100</span>
        </div>
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-label-md ${config.pillBg} ${config.pillText}`}>
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">{config.icon}</span>
          {result.riskLevel} RISK
        </div>
      </div>
      <div className="mt-8">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          <strong className="text-on-surface">Verdict:</strong> {getVerdict(result.riskLevel)}
        </p>
      </div>
    </div>
  );
}

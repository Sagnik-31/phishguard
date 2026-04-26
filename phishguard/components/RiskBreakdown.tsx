"use client";

import { useEffect, useState } from "react";
import type { BreakdownCategory } from "@/lib/types";

interface RiskBreakdownProps {
  breakdown: BreakdownCategory[];
}

function getSeverityBgColor(severity: string): string {
  switch (severity) {
    case "critical":
    case "high":
      return "bg-error";
    case "warning":
    case "medium":
      return "bg-tertiary";
    case "info":
    case "low":
    default:
      return "bg-primary";
  }
}

export default function RiskBreakdown({ breakdown }: RiskBreakdownProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setAnimate(true), 100);

    return () => {
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-md">
      <h3 className="font-label-md text-label-md text-on-surface-variant mb-6 uppercase">Risk Breakdown</h3>
      <div className="space-y-4">
        {breakdown.map((category) => (
          <div key={category.label}>
            <div className="flex justify-between text-label-sm mb-1">
              <span>{category.label}</span>
              <span className="font-bold">{category.score}%</span>
            </div>
            <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${getSeverityBgColor(category.severity)} transition-all duration-1000 ease-out`}
                style={{ width: animate ? `${category.score}%` : '0%' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

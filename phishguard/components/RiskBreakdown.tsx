"use client";

import { useEffect, useState } from "react";
import type { BreakdownCategory } from "@/lib/types";
import { getProgressColor, getSeverityColor } from "@/lib/utils";

interface RiskBreakdownProps {
  breakdown: BreakdownCategory[];
}

function getWidthClass(score: number): string {
  if (score <= 0) return "w-0";
  if (score <= 8) return "w-1/12";
  if (score <= 16) return "w-2/12";
  if (score <= 25) return "w-3/12";
  if (score <= 33) return "w-4/12";
  if (score <= 41) return "w-5/12";
  if (score <= 50) return "w-6/12";
  if (score <= 58) return "w-7/12";
  if (score <= 66) return "w-8/12";
  if (score <= 75) return "w-9/12";
  if (score <= 83) return "w-10/12";
  if (score <= 91) return "w-11/12";
  return "w-full";
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
    <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="mb-4 text-sm font-medium text-gray-400 uppercase tracking-wider">
        Risk breakdown
      </h2>
      <div className="flex flex-col gap-4">
        {breakdown.map((category) => (
          <div key={category.label}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-300">{category.label}</p>
                <p className={`text-xs uppercase ${getSeverityColor(category.severity)}`}>
                  {category.severity}
                </p>
              </div>
              <span className="text-sm text-gray-400">{category.score}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-800" aria-hidden="true">
              <div
                className={`h-full rounded-full ${getProgressColor(category.score)} transition-all duration-1000 ease-out ${
                  animate ? getWidthClass(category.score) : "w-0"
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

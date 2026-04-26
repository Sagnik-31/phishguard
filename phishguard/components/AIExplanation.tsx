import type { AnalysisResult } from "@/lib/types";
import { formatAnalyzedAt } from "@/lib/utils";

interface AIExplanationProps {
  result: AnalysisResult;
}

export default function AIExplanation({ result }: AIExplanationProps) {
  return (
    <section className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
      <h2 className="mb-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">
        AI forensic analysis
      </h2>
      <div className="border-l-2 border-cyan-500 pl-4">
        <p className="text-slate-700 text-sm leading-relaxed">{result.explanation}</p>
        <p className="mt-4 text-slate-400 text-xs font-medium">
          Analysis by Groq · {formatAnalyzedAt(result.analyzedAt)}
        </p>
      </div>
    </section>
  );
}

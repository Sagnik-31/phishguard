import type { AnalysisResult } from "@/lib/types";
import { formatAnalyzedAt } from "@/lib/utils";

interface AIExplanationProps {
  result: AnalysisResult;
}

export default function AIExplanation({ result }: AIExplanationProps) {
  return (
    <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="mb-4 text-sm font-medium text-gray-400 uppercase tracking-wider">
        AI forensic analysis
      </h2>
      <div className="border-l-2 border-cyan-500 pl-4">
        <p className="text-gray-300 text-sm leading-relaxed">{result.explanation}</p>
        <p className="mt-4 text-gray-600 text-xs">
          Analysis by Claude · {formatAnalyzedAt(result.analyzedAt)}
        </p>
      </div>
    </section>
  );
}

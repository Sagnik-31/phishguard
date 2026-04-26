import type { AnalysisResult } from "@/lib/types";

interface AIExplanationProps {
  result: AnalysisResult;
}

export default function AIExplanation({ result }: AIExplanationProps) {
  return (
    <div className="md:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-md relative overflow-hidden">
      <div className="flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined text-primary" aria-hidden="true">psychology</span>
        <h3 className="font-h3 text-h3">AI Forensic Analysis</h3>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            {result.explanation}
          </p>
          <div className="p-sm bg-surface-container-low rounded-lg border-l-4 border-primary">
            <p className="font-body-sm text-body-sm italic text-on-surface-variant">
              &quot;The combination of high-urgency language and double-obfuscated URL shorteners suggests a sophisticated data harvesting attempt.&quot;
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center bg-primary-container/10 rounded-xl p-md">
          <div className="text-center">
            <div className="text-primary font-bold text-h2 mb-1">92%</div>
            <div className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest">Confidence Score</div>
          </div>
          <div className="w-full mt-6 h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: "92%" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

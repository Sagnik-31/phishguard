import type { Finding } from "@/lib/types";
import { getSeverityColor } from "@/lib/utils";

interface FindingsCardProps {
  findings: Finding[];
}

const severityOrder: Record<Finding["severity"], number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

function getDotClass(severity: Finding["severity"]): string {
  if (severity === "critical") {
    return "bg-red-500";
  }

  if (severity === "warning") {
    return "bg-amber-500";
  }

  return "bg-cyan-500";
}

export default function FindingsCard({ findings }: FindingsCardProps) {
  const sortedFindings = [...findings].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity],
  );

  return (
    <section className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          Findings
        </h2>
        <span className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full font-medium">
          {findings.length}
        </span>
      </div>

      {sortedFindings.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          No forensic findings were detected in this input.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {sortedFindings.map((finding) => (
            <div key={finding.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start">
              <div className="flex items-center gap-2 sm:pt-1">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${getDotClass(finding.severity)}`}
                  aria-hidden="true"
                />
                <span className={`text-xs uppercase ${getSeverityColor(finding.severity)}`}>
                  {finding.severity}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{finding.category}</p>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">{finding.detail}</p>
              </div>

              {finding.snippet ? (
                <span className="max-w-full self-start truncate font-mono text-xs bg-slate-100 px-2 py-1 rounded-md text-slate-600 border border-slate-200" title={finding.snippet}>
                  {finding.snippet}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

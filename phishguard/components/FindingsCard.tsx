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
    <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          Findings
        </h2>
        <span className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full">
          {findings.length}
        </span>
      </div>

      {sortedFindings.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-800 p-4 text-sm text-gray-400">
          No forensic findings were detected in this input.
        </div>
      ) : (
        <div className="divide-y divide-gray-800">
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
                <p className="font-medium text-gray-100">{finding.category}</p>
                <p className="mt-1 text-sm text-gray-400 leading-relaxed">{finding.detail}</p>
              </div>

              {finding.snippet ? (
                <span className="max-w-full self-start truncate font-mono text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-300" title={finding.snippet}>
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

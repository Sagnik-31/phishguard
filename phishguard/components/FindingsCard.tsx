import type { Finding } from "@/lib/types";

interface FindingsCardProps {
  findings: Finding[];
}

const severityOrder: Record<Finding["severity"], number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

function getSeverityConfig(severity: Finding["severity"]) {
  if (severity === "critical") {
    return {
      pillClasses: "bg-error/10 text-error border-error/20",
      icon: "warning"
    };
  }

  if (severity === "warning") {
    return {
      pillClasses: "bg-tertiary/10 text-tertiary border-tertiary/20",
      icon: "error_outline"
    };
  }

  return {
    pillClasses: "bg-surface-container-high text-on-surface-variant border-outline-variant",
    icon: "info"
  };
}

export default function FindingsCard({ findings }: FindingsCardProps) {
  const sortedFindings = [...findings].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity],
  );

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-md">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h3 className="font-h3 text-h3 text-on-surface">
          Detailed Findings
        </h3>
        <span className="bg-surface-container text-on-surface-variant font-label-sm px-3 py-1 rounded-full">
          {findings.length}
        </span>
      </div>

      {sortedFindings.length === 0 ? (
        <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4 text-body-sm text-on-surface-variant">
          No forensic findings were detected in this input.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {sortedFindings.map((finding) => {
            const config = getSeverityConfig(finding.severity);
            return (
              <div key={finding.id} className="flex flex-col gap-2 p-4 rounded-lg bg-surface-container-lowest border border-outline-variant/50 hover:border-outline transition-colors sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-label-sm ${config.pillClasses}`}>
                      <span className="material-symbols-outlined text-[14px]" aria-hidden="true">{config.icon}</span>
                      {finding.category}
                    </span>
                  </div>
                  <p className="mt-1 text-body-sm text-on-surface-variant leading-relaxed">{finding.detail}</p>
                </div>

                {finding.snippet ? (
                  <span className="max-w-full self-start truncate font-mono text-xs bg-surface-container px-2 py-1 rounded text-on-surface-variant border border-outline-variant/30" title={finding.snippet}>
                    {finding.snippet}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

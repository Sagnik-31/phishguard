import type { ExtractedLink } from "@/lib/types";
import { truncateUrl } from "@/lib/utils";

interface ExtractedLinksProps {
  links: ExtractedLink[];
}

function getRiskBadgeConfig(riskLabel: ExtractedLink["riskLabel"]) {
  if (riskLabel === "malicious") {
    return {
      classes: "bg-error/10 text-error border-error/20",
      icon: "warning"
    };
  }

  if (riskLabel === "suspicious") {
    return {
      classes: "bg-tertiary/10 text-tertiary border-tertiary/20",
      icon: "error_outline"
    };
  }

  return {
    classes: "bg-surface-container-high text-on-surface-variant border-outline-variant",
    icon: "check_circle"
  };
}

export default function ExtractedLinks({ links }: ExtractedLinksProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
      <div className="p-md border-b border-outline-variant flex items-center justify-between">
        <h3 className="font-h3 text-h3 text-on-surface">Extracted Links</h3>
        <span className="bg-surface-container text-on-surface-variant font-label-sm px-3 py-1 rounded-full">
          {links.length}
        </span>
      </div>

      {links.length === 0 ? (
        <div className="p-4 text-body-sm text-on-surface-variant">
          No links detected in this input
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="py-3 px-md font-label-md text-label-md text-on-surface-variant uppercase">Original URL</th>
                <th className="py-3 px-md font-label-md text-label-md text-on-surface-variant uppercase">Resolved Target</th>
                <th className="py-3 px-md font-label-md text-label-md text-on-surface-variant uppercase">Risk Analysis</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => {
                const badgeConfig = getRiskBadgeConfig(link.riskLabel);
                return (
                  <tr key={link.id} className="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors">
                    <td className="py-4 px-md align-top">
                      <div className="font-mono text-body-sm text-on-surface truncate max-w-[200px]" title={link.original}>
                        {truncateUrl(link.original, 40)}
                      </div>
                    </td>
                    <td className="py-4 px-md align-top">
                      <div className={`font-mono text-body-sm truncate max-w-[200px] ${link.riskLabel === 'malicious' ? 'text-error' : 'text-on-surface-variant'}`} title={link.resolved ?? "No resolved URL"}>
                        {link.resolved ? truncateUrl(link.resolved, 40) : "Not resolved"}
                      </div>
                    </td>
                    <td className="py-4 px-md align-top">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm border ${badgeConfig.classes}`}>
                            <span className="material-symbols-outlined text-[14px]" aria-hidden="true">{badgeConfig.icon}</span>
                            <span className="uppercase">{link.riskLabel}</span>
                          </span>
                        </div>
                        <span className="text-body-sm text-on-surface-variant">{link.reason}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

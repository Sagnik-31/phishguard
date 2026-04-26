import type { ExtractedLink } from "@/lib/types";
import { truncateUrl } from "@/lib/utils";

interface ExtractedLinksProps {
  links: ExtractedLink[];
}

function getRiskBadgeClasses(riskLabel: ExtractedLink["riskLabel"]): string {
  if (riskLabel === "malicious") {
    return "text-red-400 bg-red-500/10 border-red-500/30";
  }

  if (riskLabel === "suspicious") {
    return "text-amber-400 bg-amber-500/10 border-amber-500/30";
  }

  return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
}

export default function ExtractedLinks({ links }: ExtractedLinksProps) {
  return (
    <section className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          Extracted links
        </h2>
        <span className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full font-medium">
          {links.length}
        </span>
      </div>

      {links.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          No links detected in this input
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="pb-3 pr-4 font-medium">
                  URL
                </th>
                <th scope="col" className="pb-3 pr-4 font-medium">
                  Resolved
                </th>
                <th scope="col" className="pb-3 pr-4 font-medium">
                  Risk
                </th>
                <th scope="col" className="pb-3 font-medium">
                  Reason
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {links.map((link) => (
                <tr key={link.id}>
                  <td className="py-4 pr-4 align-top">
                    <span className="font-mono text-xs text-slate-700 bg-slate-50 px-1 py-0.5 rounded" title={link.original}>
                      {truncateUrl(link.original, 40)}
                    </span>
                  </td>
                  <td className="py-4 pr-4 align-top">
                    <span className="font-mono text-xs text-slate-500 bg-slate-50 px-1 py-0.5 rounded" title={link.resolved ?? "No resolved URL"}>
                      {link.resolved ? truncateUrl(link.resolved, 40) : "Not resolved"}
                    </span>
                  </td>
                  <td className="py-4 pr-4 align-top">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium uppercase ${getRiskBadgeClasses(link.riskLabel)}`}>
                      {link.riskLabel}
                    </span>
                  </td>
                  <td className="py-4 align-top text-sm text-slate-600">{link.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

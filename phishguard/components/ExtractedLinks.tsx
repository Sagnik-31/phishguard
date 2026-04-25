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
    <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          Extracted links
        </h2>
        <span className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full">
          {links.length}
        </span>
      </div>

      {links.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-800 p-4 text-sm text-gray-400">
          No links detected in this input
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-full text-left text-sm">
            <thead className="border-b border-gray-800 text-xs uppercase tracking-wider text-gray-500">
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
            <tbody className="divide-y divide-gray-800">
              {links.map((link) => (
                <tr key={link.id}>
                  <td className="py-4 pr-4 align-top">
                    <span className="font-mono text-xs text-gray-300" title={link.original}>
                      {truncateUrl(link.original, 40)}
                    </span>
                  </td>
                  <td className="py-4 pr-4 align-top">
                    <span className="font-mono text-xs text-gray-400" title={link.resolved ?? "No resolved URL"}>
                      {link.resolved ? truncateUrl(link.resolved, 40) : "Not resolved"}
                    </span>
                  </td>
                  <td className="py-4 pr-4 align-top">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs uppercase ${getRiskBadgeClasses(link.riskLabel)}`}>
                      {link.riskLabel}
                    </span>
                  </td>
                  <td className="py-4 align-top text-sm text-gray-400">{link.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

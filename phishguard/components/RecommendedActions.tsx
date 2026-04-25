import { Square } from "lucide-react";

interface RecommendedActionsProps {
  actions: string[];
}

export default function RecommendedActions({ actions }: RecommendedActionsProps) {
  return (
    <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="mb-4 text-sm font-medium text-gray-400 uppercase tracking-wider">
        Recommended actions
      </h2>
      <div className="flex flex-col gap-3">
        {actions.slice(0, 5).map((action) => (
          <div key={action} className="flex items-start gap-3">
            <Square className="mt-0.5 h-4 w-4 flex-none text-cyan-400" aria-hidden="true" />
            <p className="text-gray-300 text-sm leading-relaxed">{action}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

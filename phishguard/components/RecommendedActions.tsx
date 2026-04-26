interface RecommendedActionsProps {
  actions: string[];
}

export default function RecommendedActions({ actions }: RecommendedActionsProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-md">
      <h3 className="font-label-md text-label-md text-on-surface-variant mb-4 uppercase">Recommended Actions</h3>
      <ul className="space-y-3">
        {actions.slice(0, 5).map((action) => (
          <li key={action} className="flex gap-3 items-start">
            <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">check_circle</span>
            <span className="text-body-sm">{action}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

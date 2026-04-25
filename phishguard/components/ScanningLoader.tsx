import { Radar } from "lucide-react";

export default function ScanningLoader() {
  return (
    <div
      className="fixed inset-0 bg-gray-950/90 z-50 flex flex-col items-center justify-center px-6"
      role="status"
      aria-live="polite"
      aria-label="Scanning for threats"
    >
      <div className="relative flex h-24 w-24 items-center justify-center">
        <div className="absolute h-20 w-20 rounded-full border border-cyan-500 animate-ping" />
        <div className="absolute h-16 w-16 rounded-full border border-cyan-500/50" />
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 border border-cyan-500">
          <Radar className="h-6 w-6 text-cyan-400" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-6 text-cyan-400 font-medium">Scanning for threats...</p>
      <p className="mt-2 text-gray-500 text-sm text-center">
        Claude is analyzing headers, domains, and language patterns
      </p>
    </div>
  );
}

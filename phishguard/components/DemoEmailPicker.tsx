"use client";

import { demoEmails } from "@/lib/demoEmails";
import { mockResults } from "@/lib/mockData";
import type { AnalysisResult } from "@/lib/types";

interface DemoEmailPickerProps {
  onSelectEmail: (email: string, result: AnalysisResult) => void;
}

export default function DemoEmailPicker({ onSelectEmail }: DemoEmailPickerProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label htmlFor="demo-email" className="text-slate-500 font-medium text-sm">
        Try a demo email →
      </label>
      <select
        id="demo-email"
        aria-label="Select a demo phishing email"
        defaultValue=""
        onChange={(event) => {
          const selectedIndex = demoEmails.findIndex((email) => email.id === event.target.value);
          const selected = demoEmails[selectedIndex];
          if (selected) {
            onSelectEmail(selected.content, {
              ...mockResults[selectedIndex],
              analyzedAt: new Date().toISOString(),
            });
          }
        }}
        className="bg-white border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-slate-900 rounded-xl px-4 py-3 outline-none transition-all text-sm shadow-sm"
      >
        <option value="" disabled>
          -- Select a demo email --
        </option>
        {demoEmails.map((email) => (
          <option key={email.id} value={email.id}>
            {email.label}
          </option>
        ))}
      </select>
    </div>
  );
}

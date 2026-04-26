"use client";

import { demoEmails } from "@/lib/demoEmails";
import { mockResults } from "@/lib/mockData";
import type { AnalysisResult } from "@/lib/types";

interface DemoEmailPickerProps {
  onSelectEmail: (email: string, result: AnalysisResult) => void;
}

export default function DemoEmailPicker({ onSelectEmail }: DemoEmailPickerProps) {
  const handleSelect = (index: number) => {
    const selected = demoEmails[index];
    if (selected) {
      onSelectEmail(selected.content, {
        ...mockResults[index],
        analyzedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="mt-xl max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-gutter">
        <h3 className="font-h3 text-h3 text-on-surface">Try a sample analysis</h3>
        <span className="font-label-sm text-label-sm text-on-surface-variant">Click to auto-fill</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter text-left">
        <button 
          onClick={() => handleSelect(0)}
          className="group p-md bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-left hover:border-primary transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-2 mb-xs text-tertiary">
            <span className="material-symbols-outlined text-[20px]">mail</span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider">Fake Banking</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">&quot;Your account access has been restricted. Click here to verify...&quot;</p>
        </button>
        <button 
          onClick={() => handleSelect(1)}
          className="group p-md bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-left hover:border-primary transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-2 mb-xs text-secondary">
            <span className="material-symbols-outlined text-[20px]">link</span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider">URL Squatting</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">https://auth.microsoft-security-verify.net/login?id=4821</p>
        </button>
        <button 
          onClick={() => handleSelect(2)}
          className="group p-md bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-left hover:border-primary transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-2 mb-xs text-primary">
            <span className="material-symbols-outlined text-[20px]">work</span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider">Social Engineering</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">&quot;Attached is the updated Q4 payroll spreadsheet for review.&quot;</p>
        </button>
      </div>
    </div>
  );
}

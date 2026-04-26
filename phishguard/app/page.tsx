"use client";

import { useState } from "react";
import DemoEmailPicker from "@/components/DemoEmailPicker";
import Header from "@/components/Header";
import InputPanel from "@/components/InputPanel";
import type { AnalysisResult } from "@/lib/types";

export default function HomePage() {
  const [input, setInput] = useState("");
  const [demoResult, setDemoResult] = useState<AnalysisResult | null>(null);

  function handleInputChange(value: string) {
    setInput(value);
    setDemoResult(null);
  }

  function handleDemoSelect(email: string, result: AnalysisResult) {
    setInput(email);
    setDemoResult(result);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-4 py-12 sm:px-6">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
            Detect phishing. Before it&apos;s too late.
          </h1>
          <p className="mt-4 text-slate-600 text-lg max-w-2xl mx-auto">
            Paste a suspicious email or URL and get a forensic threat assessment in seconds.
          </p>
        </div>

        <InputPanel input={input} onInputChange={handleInputChange} demoResult={demoResult} />

        <div className="w-full">
          <DemoEmailPicker onSelectEmail={handleDemoSelect} />
        </div>
      </section>
    </main>
  );
}

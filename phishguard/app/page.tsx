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
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <Header />
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-4 py-12 sm:px-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-100">
            Detect phishing. Before it&apos;s too late.
          </h1>
          <p className="mt-4 text-gray-400 text-lg">
            Paste a suspicious email or URL and get a forensic threat assessment in seconds.
          </p>
        </div>

        <InputPanel input={input} onInputChange={handleInputChange} demoResult={demoResult} />

        <div className="w-full">
          <DemoEmailPicker onSelectEmail={handleDemoSelect} />
        </div>

        <footer className="text-gray-600 text-xs">
          PhishGuard uses Gemini AI for forensic analysis
        </footer>
      </section>
    </main>
  );
}

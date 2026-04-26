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
    <>
      <Header />
      <main className="pt-32 pb-20">
        <section className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md mb-8">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            AI-Powered Threat Intelligence
          </div>
          <h1 className="font-h1 text-h1 text-on-background max-w-3xl mx-auto mb-6">
            Detect Phishing. Before it&apos;s too late.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-12">
            Unmask malicious links, fraudulent emails, and deceptive sites with our enterprise-grade security engine. Zero-day protection for your digital life.
          </p>

          <InputPanel input={input} onInputChange={handleInputChange} demoResult={demoResult} />

          <DemoEmailPicker onSelectEmail={handleDemoSelect} />
        </section>

        {/* Stats Bento Grid Section */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 mt-40">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter h-auto md:h-[500px]">
            <div className="md:col-span-8 bg-primary-container text-on-primary-container p-xl rounded-xl relative overflow-hidden flex flex-col justify-end">
              <img className="absolute top-0 right-0 w-1/2 h-full object-cover mix-blend-overlay opacity-30" alt="Cybersecurity digital blue code abstract background representing high-tech security and data protection" src="https://lh3.googleusercontent.com/aida-public/AB6AXuANKfsnaiqnAMtTNwRKleSGukH2dMUjkj1wN0pLIP0tssMmkfKeWWBRFQLNIbnWQ6BOVf4ILQNuEqU_drBZaj27QxaN3hvuEA0B5Mzo12P_12tIN6MWJ2GMyFdgb5Sc_iIYqra8iaRSsWjjGj6JzTgh05R0IxxHm9lSLwB4bTFXL_PoqvDKaxyqkLTkwF28g4dbnQTRunJWHKHG6tXgD9yn4-QqXviTHLZcaisY8ZDY__wafxdJaeYbYwGoh6xOF_NMo5LHRRFZ6uBB"/>
              <h2 className="font-h2 text-h2 mb-4">Enterprise Grade Scanning</h2>
              <p className="font-body-md text-body-md opacity-90 max-w-md">Our neural networks scan millions of signatures daily to identify even the most sophisticated spear-phishing attempts before they reach your inbox.</p>
            </div>
            <div className="md:col-span-4 grid grid-rows-2 gap-gutter">
              <div className="bg-surface-container-high p-md rounded-xl flex flex-col justify-center border border-outline-variant/20">
                <span className="font-h1 text-h1 text-primary mb-2">99.9%</span>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Detection Rate</p>
              </div>
              <div className="bg-surface-container-high p-md rounded-xl flex flex-col justify-center border border-outline-variant/20">
                <span className="font-h1 text-h1 text-tertiary mb-2">&lt;2s</span>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Analysis Time</p>
              </div>
            </div>
          </div>
        </section>

        {/* Security Features Section */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 mt-40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-[32px]">biotech</span>
              </div>
              <h3 className="font-h3 text-h3 mb-4">Heuristic Analysis</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Scanning for linguistic patterns and behavioral cues typical of malicious intent.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-tertiary/10 text-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-[32px]">public</span>
              </div>
              <h3 className="font-h3 text-h3 mb-4">Global Intelligence</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Real-time sync with global threat databases and blocklists across the web.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-[32px]">terminal</span>
              </div>
              <h3 className="font-h3 text-h3 mb-4">Header Inspections</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Deconstruct email SMTP headers to find hidden spoofing and routing anomalies.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 mt-20">
        <div className="py-12 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 font-['Inter'] text-sm">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <div className="text-lg font-bold text-slate-900">PhishGuard Intelligence</div>
            <p className="text-slate-500">© 2024 PhishGuard Intelligence. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a className="text-slate-500 hover:text-slate-900 transition-colors duration-200" href="#">Privacy Policy</a>
            <a className="text-slate-500 hover:text-slate-900 transition-colors duration-200" href="#">Terms of Service</a>
            <a className="text-slate-500 hover:text-slate-900 transition-colors duration-200" href="#">Security Disclosure</a>
            <a className="text-slate-500 hover:text-slate-900 transition-colors duration-200" href="#">Contact Support</a>
          </div>
        </div>
      </footer>
    </>
  );
}

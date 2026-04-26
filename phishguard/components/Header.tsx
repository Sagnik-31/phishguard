import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="" width={32} height={32} priority />
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-semibold text-slate-900">PhishGuard</span>
            <span className="text-cyan-600 text-sm font-medium">Forensics Sandbox</span>
          </div>
        </div>
      </div>
    </header>
  );
}

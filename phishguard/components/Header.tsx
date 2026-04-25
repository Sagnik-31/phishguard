import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur border-b border-gray-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="" width={32} height={32} priority />
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-semibold text-gray-100">PhishGuard</span>
            <span className="text-cyan-400 text-sm">Forensics Sandbox</span>
          </div>
        </div>
        <div className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full">
          Powered by Claude
        </div>
      </div>
    </header>
  );
}

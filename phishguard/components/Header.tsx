import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-outline-variant/30 shadow-sm">
      <div className="flex justify-between items-center h-16 w-full px-6 md:px-12 max-w-7xl mx-auto font-['Inter'] antialiased tracking-tight">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="" width={32} height={32} priority className="invert brightness-0" />
          <div className="text-2xl font-extrabold tracking-tighter text-primary">PhishGuard</div>
        </div>
        <nav className="hidden md:flex gap-8 items-center">
          <Link href="/" className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200">Home</Link>
          <Link href="/" className="text-primary font-semibold border-b-2 border-primary pb-1 transition-colors duration-200">Dashboard</Link>
        </nav>
        <div className="flex items-center gap-4">

          <button className="bg-primary px-6 py-2 rounded-lg text-on-primary font-semibold hover:opacity-90 active:opacity-80 transition-all duration-100">Analyze Now</button>
        </div>
      </div>
    </header>
  );
}

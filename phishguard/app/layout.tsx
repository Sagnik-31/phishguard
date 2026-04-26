import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});
//trigger redploy
export const metadata: Metadata = {
  title: "PhishGuard",
  description: "Phishing forensics sandbox powered by Gemini AI.",
};

export const viewport: Viewport = {
  themeColor: "#f8f9ff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body className={`${inter.className} bg-background text-on-background antialiased font-body-md overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}

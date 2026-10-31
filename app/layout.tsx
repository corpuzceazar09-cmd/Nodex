import type { Metadata } from "next";
import { Geist, Geist_Mono, Pixelify_Sans } from "next/font/google";
import { GameProvider } from "@/components/GameProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pixelify = Pixelify_Sans({
  variable: "--font-pixel",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nodex — Logic Gate Game (Wireframe)",
  description:
    "A gamified learning system for logic gates. Clickable wireframe/mock build.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${pixelify.variable} h-full antialiased`}
    >
      <body className="flex h-dvh min-h-dvh flex-col overflow-hidden bg-[#34304a] font-mono text-[#3b3452]">
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "TedxITS Frontend Live Coding",
  description:
    "Remake of the classic CSSBattle with modern tech and premium design.",
};

import { Toaster } from "@/components/ui/sonner";
import Layouts from "@/Layouts/Layouts";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jetbrainsMono.className} antialiased bg-[#050505] text-white selection:bg-primary/30`}
      >
        <Providers>
          <Layouts>{children}</Layouts>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}

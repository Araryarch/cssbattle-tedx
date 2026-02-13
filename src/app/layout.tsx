import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { metadata, viewport } from "./metadata";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

import { Toaster } from "@/components/ui/sonner";
import Layouts from "@/Layouts/Layouts";

export { metadata, viewport };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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

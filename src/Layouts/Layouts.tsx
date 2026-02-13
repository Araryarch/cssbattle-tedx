"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layouts({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isDashboard = pathname?.startsWith("/dashboard");
  const isSocials = pathname?.startsWith("/socials");
  const isChat = pathname?.startsWith("/chat");
  const isBattle = pathname?.includes("/battle/");

  // Admin has its own sidebar layout — no navbar or footer
  if (isAdmin) {
    return <>{children}</>;
  }

  // Full-page layouts: navbar but no footer
  const isFullPage = isDashboard || isSocials || isChat || isBattle;
  if (isFullPage) {
    return (
      <>
        <Navbar />
        {children}
      </>
    );
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

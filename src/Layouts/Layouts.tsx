"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layouts({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isCertificate = pathname?.startsWith("/certificate/");
  const isDashboard = pathname?.startsWith("/dashboard");
  const isSocials = pathname?.startsWith("/socials");
  const isChat = pathname?.startsWith("/chat");
  const isBattle = pathname?.includes("/battle/");

  // Admin and Certificates have their own special layouts — no standard navbar or footer
  if (isAdmin || isCertificate) {
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

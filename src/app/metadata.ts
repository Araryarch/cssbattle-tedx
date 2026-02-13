import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://stylewars.dev"),
  title: {
    default: "StyleWars - The Ultimate CSS Battle Platform",
    template: "%s | StyleWars",
  },
  description:
    "Master your CSS skills through competitive coding battles. Challenge developers worldwide, climb the leaderboard, and become a StyleWars champion. Free online CSS battles, challenges, and contests.",
  keywords: [
    "CSS battle",
    "CSS challenge",
    "frontend coding",
    "web development",
    "CSS competition",
    "coding game",
    "stylewars",
    "CSS mastery",
    "frontend skills",
    "live coding",
    "code battle",
    "HTML CSS challenge",
    "responsive design",
    "CSS tricks",
  ],
  authors: [{ name: "StyleWars Team" }],
  creator: "StyleWars",
  publisher: "StyleWars",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://stylewars.dev",
    siteName: "StyleWars",
    title: "StyleWars - The Ultimate CSS Battle Platform",
    description:
      "Master your CSS skills through competitive coding battles. Challenge developers worldwide, climb the leaderboard, and become a StyleWars champion.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "StyleWars - CSS Battle Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StyleWars - The Ultimate CSS Battle Platform",
    description:
      "Master your CSS skills through competitive coding battles. Challenge developers worldwide and climb the leaderboard!",
    creator: "@stylewars",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://stylewars.dev",
    languages: {
      en: "https://stylewars.dev",
    },
  },
  category: "technology",
  classification: "Developer Tools - Coding Games",
};

export const viewport = {
  themeColor: "#ef4444",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

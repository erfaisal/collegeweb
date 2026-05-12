import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "@/providers/SettingsProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const DEFAULT_TITLE = process.env.NEXT_PUBLIC_DEFAULT_SEO_TITLE || "Lumina CMS | Excellence in Education";
const DEFAULT_DESCRIPTION = process.env.NEXT_PUBLIC_DEFAULT_SEO_DESCRIPTION || "Official website of Lumina Institute, empowering the next generation of innovators and healthcare professionals.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | Lumina CMS",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "institution",
    "university",
    "college",
    "education",
    "admissions",
    "academics",
    "research",
    "campus",
  ],
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "Lumina CMS",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${inter.variable} font-sans antialiased min-h-screen flex flex-col
          bg-[var(--background-color)] text-[var(--text-color)]
          transition-colors duration-300 ease-in-out
        `}
      >
        <SettingsProvider>
          <ThemeProvider>
            {/* The semantic root layout structure */}
            <div className="flex flex-col min-h-screen relative w-full">
              {children}
            </div>
          </ThemeProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}

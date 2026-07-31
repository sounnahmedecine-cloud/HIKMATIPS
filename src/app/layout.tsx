import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { OfflineBanner } from "@/components/OfflineBanner";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { ClientLayout } from "@/components/ClientLayout";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://studio--studio-5790524114-6339d.us-central1.hosted.app"),
  title: "HikmaClips — Sagesse Islamique Quotidienne",
  description: "Découvrez des hadiths, versets coraniques et invocations authentiques générés par intelligence artificielle. Partagez la sagesse islamique avec de belles images.",
  keywords: ["hadith", "islam", "coran", "sagesse", "hikma", "invocation", "dua", "rappel spirituel"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HikmaClips",
  },
  openGraph: {
    title: "HikmaClips — Sagesse Islamique Quotidienne",
    description: "Hadiths, versets et invocations générés par IA pour votre rappel spirituel quotidien.",
    type: "website",
    locale: "fr_FR",
    siteName: "HikmaClips",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "HikmaClips",
    description: "Sagesse islamique quotidienne par IA",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#10B981" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@400;700;900&family=Amiri:wght@400;700&family=Noto+Naskh+Arabic:400;700&family=Roboto:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${spaceGrotesk.variable} font-body antialiased min-h-screen`}>
        <FirebaseClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            themes={['light', 'dark', 'maroc']}
          >
            <ErrorBoundary>
              <ClientLayout>
                <div className="h-full w-full p-4 safe-pb-20 safe-pt-10 md:p-8">
                  {children}
                </div>
              </ClientLayout>
            </ErrorBoundary>
            <OfflineBanner />
            <Toaster />
          </ThemeProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

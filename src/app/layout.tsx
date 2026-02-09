import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { ClientLayout } from "@/components/ClientLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "HikmaClips",
  description: "Partagez de belles images de sagesse islamique sur les réseaux sociaux.",
  icons: {
    icon: "https://res.cloudinary.com/db2ljqpdt/image/upload/v1770108678/ChatGPT_Image_2_f%C3%A9vr._2026_23_43_44_qmfwbc.png",
    apple: "https://res.cloudinary.com/db2ljqpdt/image/upload/v1770108678/ChatGPT_Image_2_f%C3%A9vr._2026_23_43_44_qmfwbc.png",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Amiri:wght@400;700&family=Noto+Naskh+Arabic:wght@400;700&family=Roboto:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

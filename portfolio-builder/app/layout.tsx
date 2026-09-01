import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RecaptchaProvider } from "@/components/RecaptchaProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portfolio Builder",
  description: "Create stunning portfolios with ease",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Lato:wght@400;700&family=Merriweather:wght@400;700&family=Open+Sans:wght@400;600;700&family=Lora:wght@400;600;700&family=Poppins:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Montserrat:wght@400;500;600;700&family=Raleway:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Cormorant+Garamond:wght@400;500;600;700&family=Roboto+Slab:wght@400;500;600;700&family=League+Spartan:wght@400;500;600;700&family=Titillium+Web:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=Rubik:wght@400;500;600;700&family=Josefin+Sans:wght@400;500;600;700&family=Nunito:wght@400;600;700&family=Libre+Franklin:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=Work+Sans:wght@400;500;600;700&family=Oswald:wght@400;500;600;700&family=Barlow:wght@400;500;600;700&family=Ubuntu:wght@400;500;700&family=JetBrains+Mono:wght@400;500;700&family=Libre+Baskerville:wght@400;700&family=Neuton:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <RecaptchaProvider>{children}</RecaptchaProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1f2937',
              color: '#fff',
              fontSize: '14px',
              borderRadius: '8px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}

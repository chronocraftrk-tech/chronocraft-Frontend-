import { Playfair_Display, Inter } from "next/font/google";
import SessionProvider from "@/components/providers/SessionProvider";
import GoldCurtain from "@/components/ui/GoldCurtain";
import FloatingWhatsApp from "@/components/storefront/FloatingWhatsApp";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Chrono Craft — Premium Luxury Watches India",
    template: "%s | Chrono Craft",
  },
  description:
    "India's premier destination for authenticated brand-new luxury timepieces. Shop Rolex, Omega, Patek Philippe, Audemars Piguet and more.",
  keywords: [
    "luxury watches India",
    "Rolex India",
    "Omega India",
    "Patek Philippe India",
    "buy luxury watch",
    "pre-owned luxury watches",
    "authenticated watches",
    "Chrono Craft",
  ],
  authors: [{ name: "Chrono Craft", url: siteUrl }],
  creator: "Chrono Craft",
  publisher: "Chrono Craft",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Chrono Craft",
    title: "Chrono Craft — Premium Luxury Watches India",
    description:
      "Authenticated brand-new luxury timepieces from Rolex, Omega, Patek Philippe and more. Delivered across India.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Chrono Craft — Premium Luxury Watches",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chrono Craft — Premium Luxury Watches India",
    description: "Authenticated luxury watches from the world's finest brands.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0A0A0A" />
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              name: "Chrono Craft",
              url: siteUrl,
              description:
                "India's premier destination for authenticated brand-new luxury timepieces.",
              address: { "@type": "PostalAddress", addressCountry: "IN" },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+918850852021",
                contactType: "customer service",
                availableLanguage: ["English", "Hindi"],
              },
              sameAs: [`https://wa.me/918850852021`],
            }),
          }}
        />
      </head>
      <body className={`${playfairDisplay.variable} ${inter.variable} font-body antialiased`}>
        <SessionProvider>
          {children}
          <GoldCurtain />
          <FloatingWhatsApp />
        </SessionProvider>
      </body>
    </html>
  );
}

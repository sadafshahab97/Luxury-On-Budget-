import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import { ProductProvider } from "./context/ProductContext";
import { ToastProvider } from "./components/ToastContext";
import { Navbar } from "./components/Navbar";
import { GoogleAnalytics } from "@next/third-parties/google";

const jakarta = Plus_Jakarta_Sans({
  weight: ["400", "800"],
  style: "normal",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Luxury On Budget | Discover Trending Viral Finds",
    template: "%s | Luxury On Budget",
  },
  description:
    "Find high-quality viral products from Amazon, Temu, and AliExpress at affordable prices. Your go-to source for luxury on a budget.",
  keywords: [
    "Viral Products",
    "Luxury on Budget",
    "Affiliate Marketing",
    "Trending Finds",
    "Pinterest Trends",
  ],
  authors: [{ name: "Sadaf Shahab" }],
  openGraph: {
    title: "Luxury On Budget",
    description: "Discover trending viral products at the best prices.",
    url: "https://luxury-on-budget.vercel.app/",
    siteName: "Luxury On Budget",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxury On Budget",
    description: "High-quality viral products at affordable prices.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Luxury On Budget",
    url: "https://luxury-on-budget.vercel.app/",
    description: "Discover viral products from top e-commerce platforms.",
    publisher: {
      "@type": "Organization",
      name: "Luxury On Budget",
      logo: {
        "@type": "ImageObject",
        url: "https://luxury-on-budget.vercel.app/logo.png",
      },
    },
  };
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <html lang="en">
      <head>
        {/* JSON-LD Script inject karna */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${jakarta.className} ${jakarta.style} h-full antialiased min-h-full flex flex-col bg-slate-50 text-slate-900`}
      >
        <ProductProvider>
          <ToastProvider>
            <Navbar />
            <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
              {children}
            </main>
          </ToastProvider>
        </ProductProvider>
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}

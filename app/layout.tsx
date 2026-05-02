import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Providers ko import karein (apne file path ke mutabiq check karlein)
import { ProductProvider } from "./context/ProductContext";
import { ToastProvider } from "./components/ToastContext";
import { Navbar } from "./components/Navbar";

const jakarta = Plus_Jakarta_Sans({
  weight: ["400", "800"],
  style: "normal",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PinTrending - Viral Finds",
  description: "Discover the latest trending products",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jakarta.className} ${jakarta.style} h-full antialiased min-h-full flex flex-col bg-slate-50 text-slate-900`}
      >
        {/* Sabse pehle ProductProvider, uske andar ToastProvider */}
        <ProductProvider>
          <ToastProvider>
            <Navbar />
            <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
              {children}
            </main>
            {/* Aap yahan Footer bhi add kar sakte hain */}
          </ToastProvider>
        </ProductProvider>
      </body>
    </html>
  );
}

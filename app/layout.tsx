import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import Providers from "../components/Providers";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// 1. Define Viewport (Better for mobile SEO)
export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

// 2. Comprehensive Metadata
export const metadata: Metadata = {
  title: {
    default: "Share Vault | Simple. Secure. Instant.",
    template: "%s | Share Vault", // Allows sub-pages to be "Login | Share Vault"
  },
  description:
    "Share Vault is the simplest and most secure way to store and share your files instantly.",
  keywords: [
    "file sharing",
    "secure vault",
    "cloud storage",
    "instant sharing",
  ],
  authors: [{ name: "Your Name/Brand" }],

  // Icons configuration (Favicon)
  icons: {
    icon: [
      {
        url: "/logo.svg", // Path to your file in the /public folder
        type: "image/svg+xml",
      },
    ],
  },
  verification: {
    google: "google57fa82c641e47f3a.html",
  },

  // Open Graph (For Facebook, LinkedIn, Discord)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://your-domain.com",
    siteName: "Share Vault",
    title: "Share Vault | Simple. Secure. Instant.",
    description: "Simple. Secure. Instant file sharing.",
    images: [
      {
        url: "/og-image.png", // Create a 1200x630 image and put it in /public
        width: 1200,
        height: 630,
        alt: "Share Vault Preview",
      },
    ],
  },

  // Twitter/X Card
  twitter: {
    card: "summary_large_image",
    title: "Share Vault",
    description: "Simple. Secure. Instant file sharing.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

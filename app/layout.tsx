import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site } from "./site-data";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: site.title,
  description: site.description,
  authors: [{ name: site.name }],
  creator: site.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: site.title,
    description: site.description,
    url: "/",
    siteName: `${site.name} — Portfolio`,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: `${site.name} — ${site.headline.join(" ")}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: ["/og.png"],
  },
  icons: {
    icon: {
      url: "/favicon.png",
      type: "image/png",
      sizes: "512x512",
    },
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#070806",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: site.role,
    email: `mailto:${site.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Delhi",
      addressCountry: "IN",
    },
    sameAs: [
      "https://github.com/axdy02",
      "https://www.linkedin.com/in/ansh-kapoor-b5a929358/",
    ],
    url: siteUrl,
  };

  return (
    <html lang="en">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}

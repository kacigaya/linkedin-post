import { SiteFooter } from "@/components/site-footer";
import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { SiteNav } from "@/components/site-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { SITE_URL } from "@/app/site";
import "./globals.css";

// GitHub Pages cannot set response headers, so the CSP ships as a meta tag.
// `frame-ancestors` is not honoured in meta form and is left out. React needs
// eval for development diagnostics; never grant it in production.
const scriptSrc =
  process.env.NODE_ENV === "development"
    ? "'self' 'unsafe-inline' 'unsafe-eval'"
    : "'self' 'unsafe-inline'";
// Everything runs client-side: no remote origins to talk to, and uploaded
// avatars/images stay as blob/data URLs in the page.
const csp = `default-src 'self'; script-src ${scriptSrc}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' data: blob:; object-src 'none'; base-uri 'self'; form-action 'self'`;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL + "/"),
  title: "LinkedIn Post Generator",
  description:
    "Write a LinkedIn post mockup, edit it like any other text field, and download it as a PNG. Runs in your browser.",
  alternates: { canonical: `${SITE_URL}/` },
  referrer: "strict-origin-when-cross-origin",
  robots: { index: true, follow: true },
  openGraph: {
    title: "LinkedIn Post Generator",
    description:
      "Build a LinkedIn post mockup and export it as a PNG. No upload, no account.",
    type: "website",
    url: `${SITE_URL}/`,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#161616" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta httpEquiv="Content-Security-Policy" content={csp} />
      </head>
      <body className={`${inter.variable} ${geistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-lg focus:border focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Skip to main content
          </a>
          <SiteNav />
          {children}
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}

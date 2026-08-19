import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LinkedIn Post Generator",
  description:
    "Write a LinkedIn post mockup, edit every word freely, and download it as a PNG. Runs entirely in your browser.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "LinkedIn Post Generator",
    description: "Design a LinkedIn post mockup and export it as a PNG. No upload, no account.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          // Applies the stored theme before paint so the page never flashes.
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

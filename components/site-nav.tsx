"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import icon from "@/public/icon.svg";

/** Muzik's top bar: one rounded card-coloured strip holding the mark and the theme switch. */
export function SiteNav() {
  const { resolvedTheme, setTheme } = useTheme();
  // next-themes knows the theme on its first client render but the server does
  // not, so anything derived from it has to wait a tick or hydration mismatches.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dark = resolvedTheme === "dark";

  return (
    <header className="px-4 pt-2 sm:px-8">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-12 w-full max-w-6xl items-center justify-between gap-2 rounded-xl border bg-card/80 pr-1.5 pl-3 shadow-sm backdrop-blur sm:pr-2 sm:pl-4"
      >
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 rounded-md font-semibold text-sm outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
        >
          {/* Static import so the URL picks up basePath; a bare "/icon.svg" would not. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={icon.src} alt="" width={20} height={20} className="size-5 shrink-0 rounded-[5px]" />
          <span className="truncate">
            <span translate="no">LinkedIn</span> Post Generator
          </span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(dark ? "light" : "dark")}
          aria-label={mounted ? `Switch to ${dark ? "light" : "dark"} theme` : "Switch theme"}
        >
          {/* Swapped in CSS, so the server and the client render the same markup. */}
          <Sun aria-hidden="true" className="dark:hidden" />
          <Moon aria-hidden="true" className="hidden dark:block" />
        </Button>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto flex w-full max-w-6xl flex-wrap gap-4 border-t px-4 py-6 text-xs text-muted-foreground sm:px-6">
      <span>LinkedIn Post Generator</span>
      <nav aria-label="Legal" className="flex gap-4">
        <a
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          Privacy<span className="sr-only"> (opens in a new tab)</span>
        </a>
        <a
          href="/cookies"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          Cookies<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </nav>
    </footer>
  );
}

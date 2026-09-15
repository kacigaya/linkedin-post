import "./legal.css";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col" lang="en">
      <main
        id="main"
        tabIndex={-1}
        className="prose-legal mx-auto w-full max-w-3xl flex-1 px-6 py-12 text-sm text-foreground sm:py-16"
      >
        {children}
      </main>
    </div>
  );
}

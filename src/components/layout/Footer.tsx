import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="shrink-0 border-t border-border bg-card/60 backdrop-blur-sm print:hidden">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-foreground">FitCV.ai</span>
          <span>—</span>
          <span>AI Resume Builder</span>
          <span className="text-muted-foreground/50">· © {year}</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            href="#"
            className="hover:text-foreground transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="#"
            className="hover:text-foreground transition-colors"
          >
            Terms
          </Link>
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </Link>
        </nav>
      </div>
    </footer>
  );
}

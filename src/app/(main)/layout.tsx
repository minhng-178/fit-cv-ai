'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Editor pages are at /resumes/[id] — need full-height, overflow-hidden layout
  const isEditor = pathname.startsWith('/resumes/') && pathname !== '/resumes';

  return (
    <div
      className={`min-h-screen bg-background text-foreground flex flex-col ${
        isEditor ? 'overflow-hidden h-screen' : ''
      }`}
    >
      {/* Subtle decorative grid — shown on all (main) pages */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 0%, rgba(16,185,129,0.04) 0%, transparent 60%),
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
          backgroundSize: 'auto, 40px 40px, 40px 40px',
        }}
      />

      <Header />

      {/* Page content fills remaining space */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>

      {/* Footer is hidden in editor mode (full-height workspace) */}
      {!isEditor && <Footer />}
    </div>
  );
}

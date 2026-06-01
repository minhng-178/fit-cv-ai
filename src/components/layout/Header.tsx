'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from '@/lib/i18n/useTranslations';
import HeaderBrand from './header/HeaderBrand';
import HeaderActions from './header/HeaderActions';
import SettingsControls from './header/SettingsControls';

// Unified header for all (main) route pages.
export default function Header() {
  const pathname = usePathname();
  const t = useTranslations();

  const resumeId = pathname.startsWith('/resumes/') ? pathname.split('/resumes/')[1] : null;
  const isEditorPage = !!resumeId;

  return (
    <header className="h-16 border-b border-border bg-card/85 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between shrink-0 select-none z-10 print:hidden">
      {/* ── Left: Brand / Back + Editable Title ── */}
      <div className="flex items-center gap-2">
        <HeaderBrand resumeId={resumeId} />
      </div>

      {/* ── Right: Actions + Settings ── */}
      <div className="flex items-center gap-2 sm:gap-3">
        {isEditorPage ? (
          <HeaderActions resumeId={resumeId} />
        ) : (
          <nav className="flex items-center gap-1 text-sm text-muted-foreground mr-1">
            <button className="px-3 py-1.5 rounded-lg bg-muted text-foreground font-medium">
              {t.myCvs}
            </button>
          </nav>
        )}

        <SettingsControls />
      </div>
    </header>
  );
}

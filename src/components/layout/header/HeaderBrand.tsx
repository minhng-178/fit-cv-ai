'use client';

import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/useTranslations';
import EditableTitle from './EditableTitle';

// Left side of the header: brand link on list pages, back + editable title in the editor.
export default function HeaderBrand({ resumeId }: { resumeId: string | null }) {
  const t = useTranslations();

  if (!resumeId) {
    return (
      <Link href="/resumes" className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Sparkles size={16} className="text-zinc-950 font-bold" />
        </div>
        <span className="text-base font-bold tracking-tight text-foreground">FitCV.ai</span>
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/resumes"
        className="h-8 w-8 rounded-lg bg-muted/70 hover:bg-accent border border-border flex items-center justify-center transition-colors mr-1"
        title={t.backToResumes}
      >
        <ArrowLeft size={15} className="text-muted-foreground" />
      </Link>

      <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
        <Sparkles size={16} className="text-zinc-950 font-bold" />
      </div>

      <EditableTitle resumeId={resumeId} />
    </>
  );
}

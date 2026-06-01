'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useResumeStore } from '@/store/useResumeStore';
import EditorPanel from '@/components/editor/EditorPanel';
import PreviewPanel from '@/components/preview/PreviewPanel';
import AiSidebar from '@/components/editor/AiSidebar';
import { Loader2 } from 'lucide-react';
import { translations } from '@/lib/i18n/translations';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

export default function EditorPage({ params }: EditorPageProps) {
  const router = useRouter();
  const [resumeId, setResumeId] = useState<string | null>(null);

  const {
    isLoading,
    fetchResume,
    language,
  } = useResumeStore();

  const t = translations[language] || translations.vi;
  const [isDesktop, setIsDesktop] = useState(false);

  // Unwrap params (Next.js 15+ async params)
  useEffect(() => {
    params.then(({ id }) => setResumeId(id));
  }, [params]);

  useEffect(() => {
    if (resumeId) {
      fetchResume(resumeId);
    }
  }, [resumeId, fetchResume]);

  useEffect(() => {
    const checkSize = () => {
      setIsDesktop(window.innerWidth >= 1280);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  if (!resumeId || isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-emerald-500" size={36} />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">{t.initializingWorkspace}</p>
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 overflow-hidden h-[calc(100vh-64px)] print:p-0 print:h-auto print:overflow-visible">
      {isDesktop ? (
        <ResizablePanelGroup orientation="horizontal" className="h-full w-full gap-2">
          {/* Left Block: Editor Form */}
          <ResizablePanel defaultSize={40} minSize={25} maxSize={60} className="h-full overflow-hidden print:hidden">
            <EditorPanel />
          </ResizablePanel>

          <ResizableHandle className="w-1.5 bg-transparent hover:bg-emerald-500/20 transition-all duration-200 cursor-col-resize rounded-full" />

          {/* Center Block: A4 Preview */}
          <ResizablePanel defaultSize={40} minSize={25} maxSize={60} className="h-full overflow-hidden flex flex-col justify-between p-1 bg-muted/40 rounded-2xl border border-border print:border-none print:bg-white print:p-0 print:block print:h-auto">
            <PreviewPanel />
          </ResizablePanel>

          <ResizableHandle className="w-1.5 bg-transparent hover:bg-emerald-500/20 transition-all duration-200 cursor-col-resize rounded-full" />

          {/* Right Block: AI Analysis */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={35} className="h-full overflow-hidden print:hidden">
            <AiSidebar />
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <div className="grid grid-cols-1 gap-6 h-full overflow-y-auto print:block print:h-auto">
          <div className="h-full min-h-[500px] overflow-hidden print:hidden">
            <EditorPanel />
          </div>
          <div className="h-full min-h-[500px] overflow-hidden flex flex-col justify-between p-1 bg-muted/40 rounded-2xl border border-border print:border-none print:bg-white print:p-0 print:block print:h-auto">
            <PreviewPanel />
          </div>
          <div className="h-full min-h-[400px] overflow-hidden print:hidden">
            <AiSidebar />
          </div>
        </div>
      )}
    </main>
  );
}

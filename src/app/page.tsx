'use client';

import React, { useEffect, useState } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import EditorPanel from '@/components/editor/EditorPanel';
import PreviewPanel from '@/components/preview/PreviewPanel';
import AiSidebar from '@/components/editor/AiSidebar';
import { Button } from '@/components/ui/button';
import { Sparkles, Save, Printer, Loader2, Check } from 'lucide-react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

export default function Home() {
  const { 
    isLoading, 
    isSaving, 
    versionNumber, 
    fetchResume, 
    saveResume,
    resumeId
  } = useResumeStore();

  const [showSavedToast, setShowSavedToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

  useEffect(() => {
    const checkSize = () => {
      setIsDesktop(window.innerWidth >= 1280);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const handleSave = async () => {
    const success = await saveResume();
    if (success) {
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 3000);
    } else {
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-emerald-500" size={36} />
        <p className="text-zinc-400 text-sm font-medium animate-pulse">Đang khởi tạo không gian làm việc FitCV.ai...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col overflow-hidden">
      {/* Top Header */}
      <header className="h-16 border-b border-zinc-800/80 bg-[#0c0c0e]/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between shrink-0 select-none z-10 print:hidden">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles size={16} className="text-zinc-950 font-bold" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              FitCV.ai
            </h1>
            <p className="text-[10px] text-zinc-500 font-medium">Phiên bản CV: v{versionNumber}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {!resumeId && (
            <div className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20 select-none animate-pulse">
              Chế độ Demo (Offline)
            </div>
          )}

          {showSavedToast && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 animate-fade-in">
              <Check size={12} /> Đã lưu bản nháp v{versionNumber}
            </div>
          )}

          {showErrorToast && (
            <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 animate-fade-in">
              Không thể lưu bản nháp (Offline)
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={isSaving}
            variant="secondary"
          >
            {isSaving ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Save size={13} />
            )}
            Lưu bản nháp
          </Button>

          <Button
            onClick={handlePrint}
            variant="default"
          >
            <Printer size={13} />
            Tải PDF / In CV
          </Button>
        </div>
      </header>

      {/* Main Working Panel */}
      <main className="flex-1 p-4 overflow-hidden h-[calc(100vh-64px)] print:p-0 print:h-auto print:overflow-visible">
        {isDesktop ? (
          <ResizablePanelGroup orientation="horizontal" className="h-full w-full gap-2">
            {/* Left Block: Editors (Form + AI suggest items) */}
            <ResizablePanel defaultSize={40} minSize={25} maxSize={60} className="h-full overflow-hidden print:hidden">
              <EditorPanel />
            </ResizablePanel>

            <ResizableHandle className="w-1.5 bg-transparent hover:bg-emerald-500/20 transition-all duration-200 cursor-col-resize rounded-full" />

            {/* Center Block: Visual A4 Canvas Sheet */}
            <ResizablePanel defaultSize={40} minSize={25} maxSize={60} className="h-full overflow-hidden flex flex-col justify-between p-1 bg-zinc-950/40 rounded-2xl border border-zinc-900 print:border-none print:bg-white print:p-0 print:block print:h-auto">
              <PreviewPanel />
            </ResizablePanel>

            <ResizableHandle className="w-1.5 bg-transparent hover:bg-emerald-500/20 transition-all duration-200 cursor-col-resize rounded-full" />

            {/* Right Block: Gemini analysis tools */}
            <ResizablePanel defaultSize={20} minSize={15} maxSize={35} className="h-full overflow-hidden print:hidden">
              <AiSidebar />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <div className="grid grid-cols-1 gap-6 h-full overflow-y-auto print:block print:h-auto">
            {/* Left Block: Editors (Form + AI suggest items) */}
            <div className="h-full min-h-[500px] overflow-hidden print:hidden">
              <EditorPanel />
            </div>

            {/* Center Block: Visual A4 Canvas Sheet */}
            <div className="h-full min-h-[500px] overflow-hidden flex flex-col justify-between p-1 bg-zinc-950/40 rounded-2xl border border-zinc-900 print:border-none print:bg-white print:p-0 print:block print:h-auto">
              <PreviewPanel />
            </div>

            {/* Right Block: Gemini analysis tools */}
            <div className="h-full min-h-[400px] overflow-hidden print:hidden">
              <AiSidebar />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

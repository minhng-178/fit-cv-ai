'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useResumeStore } from '@/store/useResumeStore';
import EditorPanel from '@/components/editor/EditorPanel';
import PreviewPanel from '@/components/preview/PreviewPanel';
import AiSidebar from '@/components/editor/AiSidebar';
import { Button } from '@/components/ui/button';
import { Sparkles, Save, Printer, Loader2, Check, LayoutGrid, ArrowLeft, Pencil, Copy, Trash2 } from 'lucide-react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

function EditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resumeId = searchParams.get('id');

  const {
    isLoading,
    isSaving,
    versionNumber,
    resumeTitle,
    fetchResume,
    saveResume,
    resumeId: storeResumeId,
    setResumeTitle,
    validateResume,
  } = useResumeStore();

  const [isDesktop, setIsDesktop] = useState(false);

  // States for title editing and clone/delete operations
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (resumeId) {
      fetchResume(resumeId);
    } else {
      // No ?id= param — redirect to the resumes dashboard
      router.replace('/resumes');
    }
  }, [resumeId, fetchResume, router]);

  useEffect(() => {
    const checkSize = () => {
      setIsDesktop(window.innerWidth >= 1280);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const handleSave = async () => {
    const isValid = validateResume();
    if (!isValid) {
      toast.error('Vui lòng kiểm tra lại thông tin. Có một số trường không hợp lệ!');
      return;
    }
    const success = await saveResume();
    if (success) {
      toast.success(`Đã lưu bản nháp v${versionNumber}`);
    } else {
      toast.error('Không thể lưu bản nháp (Offline)');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveTitle = async () => {
    const titleVal = editedTitle.trim();
    if (!titleVal || titleVal === resumeTitle) {
      setIsEditingTitle(false);
      return;
    }

    setIsSavingTitle(true);
    try {
      await apiClient.patch(`/api/resumes/${resumeId}`, { title: titleVal });
      setResumeTitle(titleVal);
      toast.success('Đổi tên CV thành công!');
    } catch (e) {
      console.error('Error saving title:', e);
      toast.error('Không thể đổi tên CV. Vui lòng thử lại.');
    } finally {
      setIsSavingTitle(false);
      setIsEditingTitle(false);
    }
  };

  const handleCloneCurrent = async () => {
    if (!resumeId) return;
    setIsCloning(true);
    try {
      const res = await apiClient.post(`/api/resumes/${resumeId}/clone`);
      router.push(`/?id=${res.data.resume._id}`);
      toast.success('Nhân bản CV thành công!');
    } catch (e) {
      console.error('Error cloning resume:', e);
      toast.error('Không thể sao chép CV. Vui lòng thử lại.');
    } finally {
      setIsCloning(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!resumeId) return;
    setIsDeleting(true);
    setShowDeleteDialog(false);
    try {
      await apiClient.delete(`/api/resumes/${resumeId}`);
      toast.success('Đã xóa CV thành công!');
      router.push('/resumes');
    } catch (e) {
      console.error('Error deleting resume:', e);
      toast.error('Không thể xóa CV. Vui lòng thử lại.');
      setIsDeleting(false);
    }
  };

  if (!resumeId || isLoading) {
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
          {/* Back to dashboard */}
          <Link
            href="/resumes"
            className="h-8 w-8 rounded-lg bg-zinc-800/70 hover:bg-zinc-700/70 border border-zinc-700/50 flex items-center justify-center transition-colors mr-1"
            title="Quay lại danh sách CV"
          >
            <ArrowLeft size={15} className="text-zinc-400" />
          </Link>

          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles size={16} className="text-zinc-950 font-bold" />
          </div>
          <div className="flex flex-col">
            {isEditingTitle ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') setIsEditingTitle(false);
                  }}
                  disabled={isSavingTitle}
                  className="bg-zinc-800 text-xs sm:text-sm font-semibold text-zinc-100 px-2 py-0.5 rounded border border-zinc-700 focus:outline-none focus:border-emerald-500 max-w-[160px] sm:max-w-[240px]"
                  autoFocus
                />
                {isSavingTitle && <Loader2 size={12} className="animate-spin text-zinc-400" />}
              </div>
            ) : (
              <div
                className="group flex items-center gap-1.5 cursor-pointer max-w-[200px] sm:max-w-xs"
                onClick={() => {
                  setEditedTitle(resumeTitle || 'FitCV.ai');
                  setIsEditingTitle(true);
                }}
                title="Click để đổi tên CV"
              >
                <h1 className="text-sm sm:text-base font-bold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent truncate group-hover:from-zinc-50 group-hover:to-zinc-300">
                  {resumeTitle || 'FitCV.ai'}
                </h1>
                <Pencil size={12} className="text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            )}
            <p className="text-[10px] text-zinc-500 font-medium">Phiên bản CV: v{versionNumber}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {!storeResumeId && (
            <div className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20 select-none animate-pulse">
              Chế độ Demo (Offline)
            </div>
          )}

          <Link
            href="/resumes"
            className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70 transition-colors"
          >
            <LayoutGrid size={14} />
            CV của tôi
          </Link>

          {/* Clone Button */}
          <Button
            onClick={handleCloneCurrent}
            disabled={isCloning || isDeleting}
            variant="secondary"
            className="hidden sm:flex items-center gap-1.5"
            title="Nhân bản CV này"
          >
            {isCloning ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Copy size={13} />
            )}
            Nhân bản
          </Button>

          {/* Delete Button */}
          <Button
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting || isCloning}
            variant="secondary"
            className="hidden sm:flex items-center gap-1.5 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
            title="Xóa CV này"
          >
            {isDeleting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Trash2 size={13} />
            )}
            Xóa CV
          </Button>

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

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100 font-bold">Bạn có chắc muốn xóa CV này không?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Hành động này sẽ xóa vĩnh viễn CV và tất cả các phiên bản của nó. Bạn không thể hoàn tác hành động này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-850 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-500 text-zinc-50 border-none"
              onClick={handleDeleteConfirm}
            >
              Xóa CV
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="animate-spin text-emerald-500" size={36} />
          <p className="text-zinc-400 text-sm font-medium animate-pulse">Đang tải...</p>
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}

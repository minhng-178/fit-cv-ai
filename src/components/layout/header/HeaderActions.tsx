'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, Printer, Loader2, LayoutGrid, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useResumeStore } from '@/store/useResumeStore';
import apiClient from '@/lib/api-client';
import { buildExportFilename } from '@/lib/export-filename';
import { toast } from 'sonner';
import { useTranslations } from '@/lib/i18n/useTranslations';
import DeleteResumeDialog from './DeleteResumeDialog';

// Editor-only action cluster: demo badge, navigation, clone / delete / save / export.
export default function HeaderActions({ resumeId }: { resumeId: string }) {
  const t = useTranslations();
  const router = useRouter();

  const {
    isSaving,
    versionNumber,
    saveResume,
    resumeId: storeResumeId,
    resumeData,
    validateResume,
  } = useResumeStore();

  const [isCloning, setIsCloning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSave = async () => {
    if (!validateResume()) {
      toast.error(t.toastValidating);
      return;
    }
    const success = await saveResume();
    if (success) {
      toast.success(t.toastSaveSuccess.replace('{version}', versionNumber.toString()));
    } else {
      toast.error(t.toastSaveError);
    }
  };

  const handlePrint = () => {
    // The print-to-PDF dialog uses document.title as the default filename.
    // Temporarily swap it to <fullName>_<timestamp>_<encodedId>, then restore.
    const originalTitle = document.title;
    document.title = buildExportFilename({
      fullName: resumeData.personalInfo?.fullName,
      resumeId: storeResumeId,
    });

    const restoreTitle = () => {
      document.title = originalTitle;
      window.removeEventListener('afterprint', restoreTitle);
    };
    window.addEventListener('afterprint', restoreTitle);

    window.print();

    // Fallback in case 'afterprint' never fires (e.g. dialog dismissed quickly).
    setTimeout(restoreTitle, 1000);
  };

  const handleClone = async () => {
    setIsCloning(true);
    try {
      const res = await apiClient.post(`/api/resumes/${resumeId}/clone`);
      router.push(`/resumes/${res.data.resume._id}`);
      toast.success(t.toastCloneSuccess);
    } catch (e) {
      console.error('Error cloning resume:', e);
      toast.error(t.toastCloneError);
    } finally {
      setIsCloning(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setShowDeleteDialog(false);
    try {
      await apiClient.delete(`/api/resumes/${resumeId}`);
      toast.success(t.toastDeleteSuccess);
      router.push('/resumes');
    } catch (e) {
      console.error('Error deleting resume:', e);
      toast.error(t.toastDeleteError);
      setIsDeleting(false);
    }
  };

  return (
    <>
      {!storeResumeId && (
        <div className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20 select-none animate-pulse">
          {t.demoMode}
        </div>
      )}

      <Link
        href="/resumes"
        className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors border border-transparent hover:border-border"
      >
        <LayoutGrid size={14} />
        {t.myCvs}
      </Link>

      <Button
        onClick={handleClone}
        disabled={isCloning || isDeleting}
        variant="secondary"
        className="hidden sm:flex items-center gap-1.5 text-foreground border border-border hover:border-border/80 bg-muted/50 hover:bg-accent transition-all h-9 text-xs sm:text-sm"
        title={t.clone}
      >
        {isCloning ? <Loader2 size={13} className="animate-spin" /> : <Copy size={13} />}
        {t.clone}
      </Button>

      <Button
        onClick={() => setShowDeleteDialog(true)}
        disabled={isDeleting || isCloning}
        variant="secondary"
        className="hidden sm:flex items-center gap-1.5 text-foreground border border-border hover:border-rose-500/20 bg-muted/50 hover:bg-rose-500/10 hover:text-rose-500 transition-all h-9 text-xs sm:text-sm"
        title={t.deleteCv}
      >
        {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
        {t.deleteCv}
      </Button>

      <Button
        onClick={handleSave}
        disabled={isSaving}
        variant="secondary"
        className="flex items-center gap-1.5 text-foreground border border-border hover:border-border/80 bg-muted/50 hover:bg-accent transition-all h-9 text-xs sm:text-sm"
      >
        {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
        {t.saveDraft}
      </Button>

      <Button
        onClick={handlePrint}
        variant="default"
        className="bg-emerald-500 hover:bg-emerald-600 text-white dark:text-zinc-950 font-bold border-none transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 flex items-center gap-1.5 h-9 text-xs sm:text-sm shrink-0"
      >
        <Printer size={13} />
        {t.downloadPdf}
      </Button>

      <div className="h-5 w-px bg-border mx-1 shrink-0" />

      <DeleteResumeDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}

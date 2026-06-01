'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useResumeStore } from '@/store/useResumeStore';
import { Button } from '@/components/ui/button';
import {
  Sparkles, Save, Printer, Loader2, Check, LayoutGrid, ArrowLeft, Pencil, Copy, Trash2,
  Globe, Sun, Moon, Monitor
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { translations } from '@/lib/i18n/translations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { UserButton } from '@clerk/nextjs';

// Unified header for all (main) route pages
export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const resumeIdParam = pathname.startsWith('/resumes/') ? pathname.split('/resumes/')[1] : null;
  const isEditorPage = !!resumeIdParam;

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    isSaving,
    versionNumber,
    resumeTitle,
    saveResume,
    resumeId: storeResumeId,
    setResumeTitle,
    validateResume,
    language,
    setLanguage,
  } = useResumeStore();

  const t = translations[language] || translations.vi;

  // States for title editing and clone/delete operations in editor mode
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSave = async () => {
    const isValid = validateResume();
    if (!isValid) {
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
      await apiClient.patch(`/api/resumes/${resumeIdParam}`, { title: titleVal });
      setResumeTitle(titleVal);
      toast.success(t.toastRenameSuccess);
    } catch (e) {
      console.error('Error saving title:', e);
      toast.error(t.toastRenameError);
    } finally {
      setIsSavingTitle(false);
      setIsEditingTitle(false);
    }
  };

  const handleCloneCurrent = async () => {
    if (!resumeIdParam) return;
    setIsCloning(true);
    try {
      const res = await apiClient.post(`/api/resumes/${resumeIdParam}/clone`);
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
    if (!resumeIdParam) return;
    setIsDeleting(true);
    setShowDeleteDialog(false);
    try {
      await apiClient.delete(`/api/resumes/${resumeIdParam}`);
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
      <header className="h-16 border-b border-border bg-card/85 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between shrink-0 select-none z-10 print:hidden">
        {/* ── Left: Brand / Back + Editable Title ── */}
        <div className="flex items-center gap-2">
          {isEditorPage ? (
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
                      className="bg-muted text-xs sm:text-sm font-semibold text-foreground px-2 py-0.5 rounded border border-border focus:outline-none focus:border-emerald-500 max-w-[160px] sm:max-w-[240px]"
                      autoFocus
                    />
                    {isSavingTitle && <Loader2 size={12} className="animate-spin text-muted-foreground" />}
                  </div>
                ) : (
                  <div
                    className="group flex items-center gap-1.5 cursor-pointer max-w-[200px] sm:max-w-xs"
                    onClick={() => {
                      setEditedTitle(resumeTitle || 'FitCV.ai');
                      setIsEditingTitle(true);
                    }}
                    title={t.clickToRename}
                  >
                    <h1 className="text-sm sm:text-base font-bold tracking-tight text-foreground truncate">
                      {resumeTitle || 'FitCV.ai'}
                    </h1>
                    <Pencil size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground font-medium">{t.cvVersion}{versionNumber}</p>
              </div>
            </>
          ) : (
            <Link href="/resumes" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Sparkles size={16} className="text-zinc-950 font-bold" />
              </div>
              <span className="text-base font-bold tracking-tight text-foreground">FitCV.ai</span>
            </Link>
          )}
        </div>

        {/* ── Right: Actions + Settings ── */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isEditorPage ? (
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
                onClick={handleCloneCurrent}
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
            </>
          ) : (
            <nav className="flex items-center gap-1 text-sm text-muted-foreground mr-1">
              <button className="px-3 py-1.5 rounded-lg bg-muted text-foreground font-medium">
                {t.myCvs}
              </button>
            </nav>
          )}

          {/* ── System Controls: Language, Theme, Auth ── */}
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent hover:border-border rounded-xl cursor-pointer"
                  title={t.language}
                >
                  <Globe size={15} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">{t.language}</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-850" />
                <DropdownMenuItem onClick={() => setLanguage('vi')} className="flex items-center justify-between cursor-pointer focus:bg-zinc-900 focus:text-zinc-100 text-xs py-2 px-3">
                  <span>Tiếng Việt</span>
                  {language === 'vi' && <Check size={14} className="text-emerald-400" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('en')} className="flex items-center justify-between cursor-pointer focus:bg-zinc-900 focus:text-zinc-100 text-xs py-2 px-3">
                  <span>English</span>
                  {language === 'en' && <Check size={14} className="text-emerald-400" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {mounted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent hover:border-border rounded-xl cursor-pointer"
                    title={t.theme}
                  >
                    {theme === 'dark' ? <Moon size={15} /> : theme === 'light' ? <Sun size={15} /> : <Monitor size={15} />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuLabel className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">{t.theme}</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-850" />
                  <DropdownMenuItem onClick={() => setTheme('light')} className="flex items-center justify-between cursor-pointer focus:bg-zinc-900 focus:text-zinc-100 text-xs py-2 px-3">
                    <div className="flex items-center gap-2"><Sun size={13} /><span>{t.themeLight}</span></div>
                    {theme === 'light' && <Check size={14} className="text-emerald-400" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')} className="flex items-center justify-between cursor-pointer focus:bg-zinc-900 focus:text-zinc-100 text-xs py-2 px-3">
                    <div className="flex items-center gap-2"><Moon size={13} /><span>{t.themeDark}</span></div>
                    {theme === 'dark' && <Check size={14} className="text-emerald-400" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')} className="flex items-center justify-between cursor-pointer focus:bg-zinc-900 focus:text-zinc-100 text-xs py-2 px-3">
                    <div className="flex items-center gap-2"><Monitor size={13} /><span>{t.themeSystem}</span></div>
                    {theme === 'system' && <Check size={14} className="text-emerald-400" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <div className="flex items-center justify-center h-9 w-9">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: 'h-9 w-9 border border-emerald-500/25 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-500',
                    userButtonTrigger: 'h-9 w-9 rounded-full',
                  },
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Delete Confirmation Dialog (editor only) */}
      {isEditorPage && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-card border border-border text-foreground">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground font-bold">{t.deleteConfirmTitle}</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                {t.deleteConfirmDesc}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-muted border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                {t.deleteCancel}
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-rose-600 hover:bg-rose-500 text-zinc-50 border-none"
                onClick={handleDeleteConfirm}
              >
                {t.deleteConfirm}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}

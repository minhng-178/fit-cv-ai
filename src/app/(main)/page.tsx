'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useResumeStore } from '@/store/useResumeStore';
import EditorPanel from '@/components/editor/EditorPanel';
import PreviewPanel from '@/components/preview/PreviewPanel';
import AiSidebar from '@/components/editor/AiSidebar';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, Save, Printer, Loader2, Check, LayoutGrid, ArrowLeft, Pencil, Copy, Trash2,
  Globe, Sun, Moon, Monitor, User as UserIcon, LogOut, Settings
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
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    language,
    setLanguage,
  } = useResumeStore();

  const t = translations[language] || translations.vi;
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
      await apiClient.patch(`/api/resumes/${resumeId}`, { title: titleVal });
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
    if (!resumeId) return;
    setIsCloning(true);
    try {
      const res = await apiClient.post(`/api/resumes/${resumeId}/clone`);
      router.push(`/?id=${res.data.resume._id}`);
      toast.success(t.toastCloneSuccess);
    } catch (e) {
      console.error('Error cloning resume:', e);
      toast.error(t.toastCloneError);
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
      toast.success(t.toastDeleteSuccess);
      router.push('/resumes');
    } catch (e) {
      console.error('Error deleting resume:', e);
      toast.error(t.toastDeleteError);
      setIsDeleting(false);
    }
  };

  if (!resumeId || isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-emerald-500" size={36} />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">{t.initializingWorkspace}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Top Header */}
      <header className="h-16 border-b border-border bg-card/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between shrink-0 select-none z-10 print:hidden">
        <div className="flex items-center gap-2">
          {/* Back to dashboard */}
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
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
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

          {/* Clone Button */}
          <Button
            onClick={handleCloneCurrent}
            disabled={isCloning || isDeleting}
            variant="secondary"
            className="hidden sm:flex items-center gap-1.5 text-foreground border border-border hover:border-border/80 bg-muted/50 hover:bg-accent transition-all h-9 text-xs sm:text-sm"
            title={t.clone}
          >
            {isCloning ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Copy size={13} />
            )}
            {t.clone}
          </Button>

          {/* Delete Button */}
          <Button
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting || isCloning}
            variant="secondary"
            className="hidden sm:flex items-center gap-1.5 text-foreground border border-border hover:border-rose-500/20 bg-muted/50 hover:bg-rose-500/10 hover:text-rose-500 transition-all h-9 text-xs sm:text-sm"
            title={t.deleteCv}
          >
            {isDeleting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Trash2 size={13} />
            )}
            {t.deleteCv}
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            variant="secondary"
            className="flex items-center gap-1.5 text-foreground border border-border hover:border-border/80 bg-muted/50 hover:bg-accent transition-all h-9 text-xs sm:text-sm"
          >
            {isSaving ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Save size={13} />
            )}
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

          {/* Vertical Separator */}
          <div className="h-5 w-px bg-border mx-1 shrink-0" />

          {/* System settings controls */}
          <div className="flex items-center gap-1">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent hover:border-border rounded-xl cursor-pointer" title={t.language}>
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

            {/* Theme Selector */}
            {mounted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent hover:border-border rounded-xl cursor-pointer" title={t.theme}>
                    {theme === 'dark' ? <Moon size={15} /> : theme === 'light' ? <Sun size={15} /> : <Monitor size={15} />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuLabel className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">{t.theme}</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-850" />
                  <DropdownMenuItem onClick={() => setTheme('light')} className="flex items-center justify-between cursor-pointer focus:bg-zinc-900 focus:text-zinc-100 text-xs py-2 px-3">
                    <div className="flex items-center gap-2">
                      <Sun size={13} />
                      <span>{t.themeLight}</span>
                    </div>
                    {theme === 'light' && <Check size={14} className="text-emerald-400" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')} className="flex items-center justify-between cursor-pointer focus:bg-zinc-900 focus:text-zinc-100 text-xs py-2 px-3">
                    <div className="flex items-center gap-2">
                      <Moon size={13} />
                      <span>{t.themeDark}</span>
                    </div>
                    {theme === 'dark' && <Check size={14} className="text-emerald-400" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')} className="flex items-center justify-between cursor-pointer focus:bg-zinc-900 focus:text-zinc-100 text-xs py-2 px-3">
                    <div className="flex items-center gap-2">
                      <Monitor size={13} />
                      <span>{t.themeSystem}</span>
                    </div>
                    {theme === 'system' && <Check size={14} className="text-emerald-400" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/25 flex items-center justify-center font-bold text-emerald-500 hover:bg-emerald-500/25 text-[11px] select-none shrink-0 cursor-pointer" title={t.profile}>
                  U
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="flex flex-col gap-0.5 py-2 px-3">
                  <span className="text-xs font-semibold text-zinc-100">User (Demo)</span>
                  <span className="text-[9px] text-zinc-500 truncate font-medium">user@fitcv.ai</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-850" />
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer focus:bg-zinc-900 focus:text-zinc-100 text-xs py-2 px-3">
                  <UserIcon size={13} />
                  <span>{t.profile}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer focus:bg-zinc-900 focus:text-zinc-100 text-xs py-2 px-3">
                  <Settings size={13} />
                  <span>{t.settings}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-850" />
                <DropdownMenuItem className="flex items-center gap-2 text-rose-455 focus:bg-rose-500/10 focus:text-rose-400 cursor-pointer text-xs py-2 px-3">
                  <LogOut size={13} />
                  <span>{t.logout}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
            <ResizablePanel defaultSize={40} minSize={25} maxSize={60} className="h-full overflow-hidden flex flex-col justify-between p-1 bg-muted/40 rounded-2xl border border-border print:border-none print:bg-white print:p-0 print:block print:h-auto">
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
            <div className="h-full min-h-[500px] overflow-hidden flex flex-col justify-between p-1 bg-muted/40 rounded-2xl border border-border print:border-none print:bg-white print:p-0 print:block print:h-auto">
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
    </div>
  );
}

export default function Home() {
  const language = useResumeStore(state => state.language);
  const loadingText = language === 'en' ? 'Loading...' : 'Đang tải...';

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center space-y-4">
          <Loader2 className="animate-spin text-emerald-500" size={36} />
          <p className="text-muted-foreground text-sm font-medium animate-pulse">{loadingText}</p>
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}

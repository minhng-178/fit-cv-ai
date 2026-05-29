'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import {
  Sparkles,
  Plus,
  FileText,
  MoreVertical,
  Loader2,
  Clock,
  Trash2,
  Pencil,
  ChevronRight,
  AlertCircle,
  Copy,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
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

interface ResumePreview {
  fullName: string;
  title: string;
  location: string;
  template: string;
  themeColor: string;
  versionNumber: number;
  lastEdited: string;
}

interface ResumeCard {
  _id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
  preview: ResumePreview | null;
}

const THEME_COLORS: Record<string, string> = {
  emerald: '#10b981',
  blue: '#3b82f6',
  indigo: '#6366f1',
  rose: '#f43f5e',
  slate: '#64748b',
};

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 30) return `${diffDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

function MiniCVPreview({ themeColor }: { themeColor: string }) {
  const color = THEME_COLORS[themeColor] || THEME_COLORS.emerald;

  return (
    <div className="w-full h-full bg-white rounded-lg overflow-hidden flex flex-col">
      {/* Header strip */}
      <div className="px-4 py-3" style={{ backgroundColor: color + '15', borderBottom: `2px solid ${color}` }}>
        <div className="h-2.5 rounded-full w-3/4 mb-1.5" style={{ backgroundColor: color + '60' }} />
        <div className="h-1.5 rounded-full w-1/2" style={{ backgroundColor: color + '40' }} />
        <div className="h-1.5 rounded-full w-2/5 mt-1" style={{ backgroundColor: color + '30' }} />
      </div>

      {/* Body skeleton */}
      <div className="flex flex-1 gap-2 p-3">
        {/* Left column */}
        <div className="w-2/5 flex flex-col gap-2">
          <div className="h-2 rounded bg-gray-200 w-3/4" />
          <div className="space-y-1">
            <div className="h-1.5 rounded bg-gray-100 w-full" />
            <div className="h-1.5 rounded bg-gray-100 w-5/6" />
            <div className="h-1.5 rounded bg-gray-100 w-4/6" />
          </div>
          <div className="h-2 rounded bg-gray-200 w-2/3 mt-1" />
          <div className="space-y-1">
            <div className="h-1.5 rounded bg-gray-100 w-full" />
            <div className="h-1.5 rounded bg-gray-100 w-3/4" />
          </div>
        </div>

        {/* Divider */}
        <div className="w-px bg-gray-200" />

        {/* Right column */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-2 rounded w-1/2" style={{ backgroundColor: color + '50' }} />
          <div className="space-y-1">
            <div className="h-1.5 rounded bg-gray-100 w-full" />
            <div className="h-1.5 rounded bg-gray-100 w-11/12" />
            <div className="h-1.5 rounded bg-gray-100 w-4/5" />
          </div>
          <div className="h-2 rounded w-1/2 mt-1" style={{ backgroundColor: color + '50' }} />
          <div className="space-y-1">
            <div className="h-1.5 rounded bg-gray-100 w-full" />
            <div className="h-1.5 rounded bg-gray-100 w-3/4" />
            <div className="h-1.5 rounded bg-gray-100 w-5/6" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Inline rename modal ──────────────────────────────────────────────────────
interface RenameModalProps {
  currentTitle: string;
  onConfirm: (newTitle: string) => void;
  onCancel: () => void;
}

function RenameModal({ currentTitle, onConfirm, onCancel }: RenameModalProps) {
  const [value, setValue] = useState(currentTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onConfirm(value.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onCancel();
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl shadow-black/60 w-full max-w-sm mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Pencil size={13} className="text-emerald-400" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-100">Đổi tên CV</h2>
          </div>
          <button
            onClick={onCancel}
            className="h-7 w-7 rounded-lg hover:bg-zinc-800 flex items-center justify-center transition-colors"
          >
            <X size={14} className="text-zinc-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Tên CV</label>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={80}
              placeholder="Nhập tên CV..."
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="h-9 px-4 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!value.trim() || value.trim() === currentTitle}
              className="h-9 px-4 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Check size={13} />
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ResumesPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<ResumeCard | null>(null);
  const [isSavingRename, setIsSavingRename] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const fetchResumes = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/api/resumes/list');
      setResumes(res.data.resumes || []);
      if (res.data.error) setIsOffline(true);
    } catch {
      setIsOffline(true);
      setResumes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCreateNew = async () => {
    setIsCreating(true);
    try {
      const res = await apiClient.post('/api/resumes/create', { title: 'CV Chưa đặt tên' });
      router.push(`/?id=${res.data.resume._id}`);
      toast.success('Đã tạo CV mới thành công!');
    } catch (e: any) {
      console.error('Error creating resume:', e);
      toast.error('Không thể tạo CV mới. Vui lòng thử lại.');
      setIsCreating(false);
    }
  };

  const handleOpenResume = (id: string) => router.push(`/?id=${id}`);

  const handleRenameConfirm = async (newTitle: string) => {
    if (!renameTarget) return;
    setIsSavingRename(true);
    try {
      await apiClient.patch(`/api/resumes/${renameTarget._id}`, { title: newTitle });
      setResumes((prev) =>
        prev.map((r) => (r._id === renameTarget._id ? { ...r, title: newTitle } : r))
      );
      toast.success('Đổi tên CV thành công!');
    } catch (e: any) {
      console.error('Error renaming resume:', e);
      toast.error('Không thể đổi tên CV. Vui lòng thử lại.');
    } finally {
      setIsSavingRename(false);
      setRenameTarget(null);
    }
  };

  const handleClone = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setCloningId(id);
    try {
      const res = await apiClient.post(`/api/resumes/${id}/clone`);
      const cloned: ResumeCard = {
        _id: res.data.resume._id,
        title: res.data.resume.title,
        updatedAt: res.data.resume.updatedAt || new Date().toISOString(),
        createdAt: res.data.resume.createdAt || new Date().toISOString(),
        preview: null, // will show generic skeleton
      };
      setResumes((prev) => [cloned, ...prev]);
      toast.success('Nhân bản CV thành công!');
    } catch (e: any) {
      console.error('Error cloning resume:', e);
      toast.error('Không thể sao chép CV. Vui lòng thử lại.');
    } finally {
      setCloningId(null);
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    setDeletingId(id);
    setDeleteTargetId(null);
    try {
      await apiClient.delete(`/api/resumes/${id}`);
      setResumes((prev) => prev.filter((r) => r._id !== id));
      toast.success('Đã xóa CV thành công!');
    } catch (e: any) {
      console.error('Error deleting resume:', e);
      toast.error('Không thể xóa CV. Vui lòng thử lại.');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col">
      {/* Rename Modal */}
      {renameTarget && (
        <RenameModal
          currentTitle={renameTarget.title}
          onConfirm={handleRenameConfirm}
          onCancel={() => !isSavingRename && setRenameTarget(null)}
        />
      )}

      {/* Header */}
      <header className="h-16 border-b border-zinc-800/80 bg-[#0c0c0e]/80 backdrop-blur-xl px-6 flex items-center justify-between shrink-0 select-none z-10">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles size={16} className="text-zinc-950 font-bold" />
          </div>
          <span className="text-base font-bold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            FitCV.ai
          </span>
        </div>

        <nav className="flex items-center gap-1 text-sm text-zinc-400">
          <button className="px-3 py-1.5 rounded-lg bg-zinc-800/80 text-zinc-100 font-medium">
            CV của tôi
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-100 mb-1.5">CV của tôi</h1>
          <p className="text-zinc-400 text-sm">
            Tạo và quản lý nhiều phiên bản CV được tối ưu hóa cho từng vị trí ứng tuyển.
          </p>
        </div>

        {/* Offline Warning */}
        {isOffline && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            <span>
              Không thể kết nối tới cơ sở dữ liệu. Đang chạy ở chế độ Offline — dữ liệu sẽ không được lưu.
            </span>
          </div>
        )}

        {/* Resume Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 size={32} className="animate-spin text-emerald-500" />
            <p className="text-zinc-500 text-sm animate-pulse">Đang tải danh sách CV...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {/* "New Resume" card */}
            <button
              id="btn-create-new-resume"
              onClick={handleCreateNew}
              disabled={isCreating}
              className="group relative flex flex-col items-center justify-center gap-3 h-72 rounded-2xl border-2 border-dashed border-zinc-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <Loader2 size={28} className="animate-spin text-emerald-500" />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-zinc-800 group-hover:bg-emerald-500/10 border border-zinc-700 group-hover:border-emerald-500/30 flex items-center justify-center transition-all duration-300">
                  <Plus size={22} className="text-zinc-400 group-hover:text-emerald-400 transition-colors duration-300" />
                </div>
              )}
              <div className="text-center">
                <p className="text-sm font-semibold text-zinc-300 group-hover:text-emerald-400 transition-colors duration-300">
                  {isCreating ? 'Đang tạo...' : 'Tạo CV mới'}
                </p>
                <p className="text-xs text-zinc-600 mt-0.5 group-hover:text-zinc-500 transition-colors">
                  Bắt đầu từ đầu
                </p>
              </div>
            </button>

            {/* Resume Cards */}
            {resumes.map((resume) => {
              const color = THEME_COLORS[resume.preview?.themeColor || 'emerald'];
              const isDeleting = deletingId === resume._id;
              const isCloning = cloningId === resume._id;
              const isBusy = isDeleting || isCloning;

              return (
                <div
                  key={resume._id}
                  className="group relative flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-300 overflow-hidden cursor-pointer"
                  onClick={() => !isBusy && handleOpenResume(resume._id)}
                  style={{ height: '288px' }}
                >
                  {/* CV Mini Preview */}
                  <div className="flex-1 p-3 overflow-hidden">
                    <div className="w-full h-full rounded-lg overflow-hidden border border-zinc-800 group-hover:border-zinc-700 transition-colors duration-300 shadow-inner">
                      {isBusy ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-zinc-950">
                          <Loader2
                            size={20}
                            className={`animate-spin ${isDeleting ? 'text-rose-400' : 'text-sky-400'}`}
                          />
                          <span className="text-[11px] text-zinc-600">
                            {isDeleting ? 'Đang xóa...' : 'Đang sao chép...'}
                          </span>
                        </div>
                      ) : (
                        <MiniCVPreview themeColor={resume.preview?.themeColor || 'emerald'} />
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div
                    className="px-3.5 py-2.5 border-t border-zinc-800 flex items-center justify-between gap-2"
                    style={{ borderTopColor: color + '25' }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <p className="text-sm font-semibold text-zinc-100 truncate leading-tight">
                          {resume.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-500">
                        {resume.preview?.fullName && (
                          <>
                            <span className="text-[11px] truncate text-zinc-400 max-w-[80px]">{resume.preview.fullName}</span>
                            <span className="text-[9px]">•</span>
                          </>
                        )}
                        <Clock size={10} className="shrink-0" />
                        <p className="text-[11px] truncate">{timeAgo(resume.updatedAt)}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/85 flex items-center justify-center transition-colors outline-none focus:ring-1 focus:ring-zinc-700"
                            onClick={(e) => e.stopPropagation()}
                            disabled={isBusy}
                          >
                            <MoreVertical size={16} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 bg-zinc-900 border border-zinc-800 text-zinc-300">
                          {/* Rename */}
                          <DropdownMenuItem
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-zinc-800 hover:text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRenameTarget(resume);
                            }}
                          >
                            <Pencil size={13} className="text-zinc-500" />
                            <span>Đổi tên</span>
                          </DropdownMenuItem>

                          {/* Clone */}
                          <DropdownMenuItem
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-zinc-800 hover:text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100 transition-colors"
                            onClick={(e) => handleClone(e, resume._id)}
                          >
                            <Copy size={13} className="text-zinc-500" />
                            <span>Nhân bản</span>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="bg-zinc-800" />

                          {/* Delete */}
                          <DropdownMenuItem
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer text-rose-400 hover:bg-rose-500/10 focus:bg-rose-500/10 focus:text-rose-400 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTargetId(resume._id);
                            }}
                          >
                            <Trash2 size={13} />
                            <span>Xóa CV</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty state */}
            {resumes.length === 0 && !isLoading && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="h-16 w-16 rounded-2xl bg-zinc-800/80 flex items-center justify-center mb-2">
                  <FileText size={28} className="text-zinc-600" />
                </div>
                <p className="text-zinc-400 font-medium">Bạn chưa có CV nào</p>
                <p className="text-zinc-600 text-sm max-w-xs">
                  Nhấn vào &quot;Tạo CV mới&quot; để bắt đầu xây dựng CV chuyên nghiệp của bạn.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteTargetId !== null} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
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
              onClick={async () => {
                if (deleteTargetId) {
                  await handleDeleteConfirm(deleteTargetId);
                }
              }}
            >
              Xóa CV
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 0%, rgba(16,185,129,0.04) 0%, transparent 60%),
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
          backgroundSize: 'auto, 40px 40px, 40px 40px',
        }}
      />
    </div>
  );
}

"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { useResumeStore } from "@/store/useResumeStore";
import { translations } from "@/lib/i18n/translations";
import { ResumeCard as ResumeCardItem } from "@/components/resumes/ResumeCard";
import { NewResumeCard } from "@/components/resumes/NewResumeCard";
import { RenameModal } from "@/components/resumes/RenameModal";
import { DeleteConfirmDialog } from "@/components/resumes/DeleteConfirmDialog";
import { ResumeCard } from "@/types";

export default function ResumesPage() {
  const router = useRouter();
  const { language } = useResumeStore();
  const t = translations[language] || translations.vi;

  // ── State ──────────────────────────────────────────────────────────────────
  const [resumes, setResumes] = useState<ResumeCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<ResumeCard | null>(null);
  const [isSavingRename, setIsSavingRename] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const fetchResumes = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/api/resumes/list");
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

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleCreateNew = async () => {
    setIsCreating(true);
    try {
      const res = await apiClient.post("/api/resumes/create", {
        title: t.untitledCv,
      });
      router.push(`/resumes/${res.data.resume._id}`);
      toast.success(t.toastCreateSuccess);
    } catch (e) {
      console.error("Error creating resume:", e);
      toast.error(t.toastCreateError);
      setIsCreating(false);
    }
  };

  const handleOpenResume = (id: string) => router.push(`/resumes/${id}`);

  const handleRenameConfirm = async (newTitle: string) => {
    if (!renameTarget) return;
    setIsSavingRename(true);
    try {
      await apiClient.patch(`/api/resumes/${renameTarget._id}`, {
        title: newTitle,
      });
      setResumes((prev) =>
        prev.map((r) =>
          r._id === renameTarget._id ? { ...r, title: newTitle } : r,
        ),
      );
      toast.success(t.toastRenameSuccess);
    } catch (e) {
      console.error("Error renaming resume:", e);
      toast.error(t.toastRenameError);
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
        preview: null,
      };
      setResumes((prev) => [cloned, ...prev]);
      toast.success(t.toastCloneSuccess);
    } catch (e) {
      console.error("Error cloning resume:", e);
      toast.error(t.toastCloneError);
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
      toast.success(t.toastDeleteSuccess);
    } catch (e) {
      console.error("Error deleting resume:", e);
      toast.error(t.toastDeleteError);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Rename Modal (portal-style overlay) */}
      {renameTarget && (
        <RenameModal
          currentTitle={renameTarget.title}
          onConfirm={handleRenameConfirm}
          onCancel={() => !isSavingRename && setRenameTarget(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        onConfirm={() => deleteTargetId && handleDeleteConfirm(deleteTargetId)}
      />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-1.5">
            {t.dashboardTitle}
          </h1>
          <p className="text-muted-foreground text-sm">{t.dashboardDesc}</p>
        </div>

        {/* Offline warning */}
        {isOffline && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            <span>{t.offlineWarning}</span>
          </div>
        )}

        {/* Resume grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 size={32} className="animate-spin text-emerald-500" />
            <p className="text-muted-foreground text-sm animate-pulse">
              {t.loadingResumes}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {/* Create new resume card */}
            <NewResumeCard isCreating={isCreating} onCreate={handleCreateNew} />

            {/* Existing resume cards */}
            {resumes.map((resume) => (
              <ResumeCardItem
                key={resume._id}
                resume={resume}
                isDeleting={deletingId === resume._id}
                isCloning={cloningId === resume._id}
                onOpen={handleOpenResume}
                onRename={setRenameTarget}
                onClone={handleClone}
                onDelete={setDeleteTargetId}
              />
            ))}

            {/* Empty state */}
            {resumes.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-2">
                  <FileText size={28} className="text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">
                  {t.noCvsYet}
                </p>
                <p className="text-muted-foreground/80 text-sm max-w-xs">
                  {t.noCvsDesc}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}

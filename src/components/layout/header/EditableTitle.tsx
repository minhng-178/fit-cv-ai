'use client';

import { useState } from 'react';
import { Loader2, Pencil } from 'lucide-react';
import { useResumeStore } from '@/store/useResumeStore';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { useTranslations } from '@/lib/i18n/useTranslations';

// Inline-editable resume title + version label, shown in the editor header.
export default function EditableTitle({ resumeId }: { resumeId: string }) {
  const t = useTranslations();
  const { resumeTitle, setResumeTitle, versionNumber } = useResumeStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const titleVal = editedTitle.trim();
    if (!titleVal || titleVal === resumeTitle) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await apiClient.patch(`/api/resumes/${resumeId}`, { title: titleVal });
      setResumeTitle(titleVal);
      toast.success(t.toastRenameSuccess);
    } catch (e) {
      console.error('Error saving title:', e);
      toast.error(t.toastRenameError);
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex flex-col">
      {isEditing ? (
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            disabled={isSaving}
            className="bg-muted text-xs sm:text-sm font-semibold text-foreground px-2 py-0.5 rounded border border-border focus:outline-none focus:border-emerald-500 max-w-[160px] sm:max-w-[240px]"
            autoFocus
          />
          {isSaving && <Loader2 size={12} className="animate-spin text-muted-foreground" />}
        </div>
      ) : (
        <div
          className="group flex items-center gap-1.5 cursor-pointer max-w-[200px] sm:max-w-xs"
          onClick={() => {
            setEditedTitle(resumeTitle || 'FitCV.ai');
            setIsEditing(true);
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
  );
}

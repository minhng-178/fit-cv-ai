'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Check, Pencil, X } from 'lucide-react';
import { useResumeStore } from '@/store/useResumeStore';
import { translations } from '@/lib/i18n/translations';

interface RenameModalProps {
  currentTitle: string;
  onConfirm: (newTitle: string) => void;
  onCancel: () => void;
}

export function RenameModal({ currentTitle, onConfirm, onCancel }: RenameModalProps) {
  const { language } = useResumeStore();
  const t = translations[language] || translations.vi;
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Pencil size={13} className="text-emerald-400" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">{t.renameCv}</h2>
          </div>
          <button
            onClick={onCancel}
            className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X size={14} className="text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              {t.cvNameLabel}
            </label>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={80}
              placeholder={t.cvNamePlaceholder}
              className="w-full bg-background border border-border focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="h-9 px-4 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={!value.trim() || value.trim() === currentTitle}
              className="h-9 px-4 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-white dark:text-zinc-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Check size={13} />
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

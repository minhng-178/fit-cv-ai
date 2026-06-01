'use client';

import React from 'react';
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
import { useResumeStore } from '@/store/useResumeStore';
import { translations } from '@/lib/i18n/translations';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({ open, onOpenChange, onConfirm }: DeleteConfirmDialogProps) {
  const { language } = useResumeStore();
  const t = translations[language] || translations.vi;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border border-border text-foreground">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground font-bold">
            {t.deleteConfirmTitle}
          </AlertDialogTitle>
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
            onClick={onConfirm}
          >
            {t.deleteConfirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

'use client';

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
import { useTranslations } from '@/lib/i18n/useTranslations';

interface DeleteResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function DeleteResumeDialog({ open, onOpenChange, onConfirm }: DeleteResumeDialogProps) {
  const t = useTranslations();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
            onClick={onConfirm}
          >
            {t.deleteConfirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

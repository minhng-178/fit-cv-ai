"use client";

import { Loader2 } from "lucide-react";
import { Plus } from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";
import { translations } from "@/lib/i18n/translations";

interface NewResumeCardProps {
  isCreating: boolean;
  onCreate: () => void;
}

export function NewResumeCard({ isCreating, onCreate }: NewResumeCardProps) {
  const { language } = useResumeStore();
  const t = translations[language] || translations.vi;

  return (
    <button
      id="btn-create-new-resume"
      onClick={onCreate}
      disabled={isCreating}
      className="group relative flex flex-col items-center justify-center gap-3 h-72 rounded-2xl border-2 border-dashed border-border hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isCreating ? (
        <Loader2 size={28} className="animate-spin text-emerald-500" />
      ) : (
        <div className="h-12 w-12 rounded-xl bg-muted group-hover:bg-emerald-500/10 border border-border group-hover:border-emerald-500/30 flex items-center justify-center transition-all duration-300">
          <Plus
            size={22}
            className="text-muted-foreground group-hover:text-emerald-500 transition-colors duration-300"
          />
        </div>
      )}
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground group-hover:text-emerald-500 transition-colors duration-300">
          {isCreating ? t.creating : t.createNewCv}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 group-hover:text-muted-foreground/80 transition-colors">
          {t.startFromScratch}
        </p>
      </div>
    </button>
  );
}

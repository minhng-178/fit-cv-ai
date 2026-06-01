"use client";

import React from "react";
import {
  Clock,
  Copy,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MiniCVPreview } from "./MiniCVPreview";
import { useResumeStore } from "@/store/useResumeStore";
import { translations } from "@/lib/i18n/translations";
import { THEME_COLORS } from "@/constants";
import { timeAgo } from "@/lib/utils";
import { ResumeCard as ResumeCardType } from "@/types";

interface ResumeCardProps {
  resume: ResumeCardType;
  isDeleting: boolean;
  isCloning: boolean;
  onOpen: (id: string) => void;
  onRename: (resume: ResumeCardType) => void;
  onClone: (e: React.MouseEvent, id: string) => void;
  onDelete: (id: string) => void;
}

export function ResumeCard({
  resume,
  isDeleting,
  isCloning,
  onOpen,
  onRename,
  onClone,
  onDelete,
}: ResumeCardProps) {
  const { language } = useResumeStore();
  const t = translations[language] || translations.vi;

  const color = THEME_COLORS[resume.preview?.themeColor || "emerald"];
  const isBusy = isDeleting || isCloning;

  return (
    <div
      className="group relative flex flex-col rounded-2xl border border-border bg-card hover:border-border/80 hover:bg-accent/10 transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={() => !isBusy && onOpen(resume._id)}
      style={{ height: "288px" }}
    >
      {/* CV Mini Preview */}
      <div className="flex-1 p-3 overflow-hidden">
        <div className="w-full h-full rounded-lg overflow-hidden border border-border group-hover:border-border/80 transition-colors duration-300 shadow-inner">
          {isBusy ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-background">
              <Loader2
                size={20}
                className={`animate-spin ${isDeleting ? "text-rose-500" : "text-sky-500"}`}
              />
              <span className="text-[11px] text-muted-foreground">
                {isDeleting ? t.deleting : t.cloning}
              </span>
            </div>
          ) : (
            <MiniCVPreview
              themeColor={resume.preview?.themeColor || "emerald"}
            />
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div
        className="px-3.5 py-2.5 border-t border-border flex items-center justify-between gap-2"
        style={{ borderTopColor: color + "25" }}
      >
        {/* Meta info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <div
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            <p className="text-sm font-semibold text-foreground truncate leading-tight">
              {resume.title}
            </p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            {resume.preview?.fullName && (
              <>
                <span className="text-[11px] truncate text-muted-foreground max-w-[80px]">
                  {resume.preview.fullName}
                </span>
                <span className="text-[9px]">•</span>
              </>
            )}
            <Clock size={10} className="shrink-0" />
            <p className="text-[11px] truncate">
              {timeAgo(resume.updatedAt, language, t)}
            </p>
          </div>
        </div>

        {/* Actions dropdown */}
        <div
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors outline-none focus:ring-1 focus:ring-ring"
                onClick={(e) => e.stopPropagation()}
                disabled={isBusy}
              >
                <MoreVertical size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                className="flex items-center gap-2 px-3 py-2 cursor-pointer focus:bg-accent focus:text-accent-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onRename(resume);
                }}
              >
                <Pencil size={13} className="text-muted-foreground" />
                <span>{t.rename}</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="flex items-center gap-2 px-3 py-2 cursor-pointer focus:bg-accent focus:text-accent-foreground"
                onClick={(e) => handleCloneClick(e)}
              >
                <Copy size={13} className="text-muted-foreground" />
                <span>{t.clone}</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="flex items-center gap-2 px-3 py-2 cursor-pointer text-rose-500 focus:bg-rose-500/10 focus:text-rose-500"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(resume._id);
                }}
              >
                <Trash2 size={13} />
                <span>{t.deleteCv}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );

  function handleCloneClick(e: React.MouseEvent) {
    e.stopPropagation();
    onClone(e, resume._id);
  }
}

"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/store/useResumeStore";
import {
  UploadCloud,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Clipboard,
  ArrowRight,
  Briefcase,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { ResumeData } from "@/types";
import { translations } from "@/lib/i18n/translations";
import { LinkedinIcon } from "@/assets/icons";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "pdf" | "linkedin";

export default function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const { importResumeData, language } = useResumeStore();
  const t = translations[language];

  // UI Tabs & States
  const [activeTab, setActiveTab] = useState<TabType>("pdf");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // PDF file upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // LinkedIn text state
  const [linkedinText, setLinkedinText] = useState("");

  // Parsed Resume Preview State
  const [parsedData, setParsedData] = useState<ResumeData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
        setError(null);
      } else {
        setError(t.fileSelectError);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  // Reset modal states
  const handleReset = () => {
    setSelectedFile(null);
    setLinkedinText("");
    setError(null);
    setIsLoading(false);
    setParsedData(null);
    setShowPreview(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Run the AI Import extraction
  const handleImportSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let responseData: {
        success: boolean;
        data?: ResumeData;
        error?: string;
      } | null = null;

      if (activeTab === "pdf") {
        if (!selectedFile) {
          setError(t.selectFilePrompt);
          setIsLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        const res = await apiClient.post("/api/import", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        responseData = res.data as {
          success: boolean;
          data?: ResumeData;
          error?: string;
        };
      } else {
        if (!linkedinText.trim()) {
          setError(t.pastePrompt);
          setIsLoading(false);
          return;
        }

        const res = await apiClient.post("/api/import", {
          text: linkedinText,
        });
        responseData = res.data as {
          success: boolean;
          data?: ResumeData;
          error?: string;
        };
      }

      if (responseData && responseData.success && responseData.data) {
        setParsedData(responseData.data);
        setShowPreview(true);
      } else {
        throw new Error(responseData?.error || t.extractError);
      }
    } catch (err: unknown) {
      console.error("Import error:", err);
      let errMsg = t.extractError;
      if (err && typeof err === "object") {
        const typedError = err as {
          response?: { data?: { error?: string } };
          message?: string;
        };
        errMsg =
          typedError.response?.data?.error || typedError.message || errMsg;
      }
      setError(errMsg);
      toast.error(t.extractErrorToast);
    } finally {
      setIsLoading(false);
    }
  };

  // Commit imported data to Zustand store and MongoDB
  const handleApplyData = async () => {
    if (!parsedData) return;

    setIsLoading(true);
    try {
      const success = await importResumeData(parsedData);
      if (success) {
        toast.success(t.importSuccess);
        handleClose();
      } else {
        toast.error(t.importError);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : t.importError;
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px] border border-border bg-card text-foreground max-h-[85vh] overflow-y-auto flex flex-col p-0">
        {/* Header Section */}
        <DialogHeader className="p-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            <Sparkles size={20} className="text-emerald-400 shrink-0" />
            {t.importTitle}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs sm:text-sm">
            {t.importDesc}
          </DialogDescription>
        </DialogHeader>

        {/* Dynamic Screens: Preview Screen vs Import Setup Screen */}
        {showPreview && parsedData ? (
          <div className="flex-1 flex flex-col p-6 space-y-4">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-start gap-2.5">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <span className="font-bold">
                  {t.language === "vi" ? "Lưu ý:" : "Note:"}
                </span>{" "}
                {t.overwriteWarning}
              </div>
            </div>

            {/* Parsed Resume Data Preview Card */}
            <div className="p-5 rounded-xl border border-border bg-muted/20 space-y-4 max-h-[300px] overflow-y-auto">
              <div className="border-b border-border pb-3 flex justify-between items-start">
                <div>
                  <h4 className="text-base font-bold text-foreground">
                    {parsedData.personalInfo?.fullName || t.fullNamePlaceholder}
                  </h4>
                  <p className="text-xs text-emerald-400 font-medium">
                    {parsedData.personalInfo?.title || t.jobTitlePlaceholder}
                  </p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
                  {t.summaryParsed}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div>
                  <span className="font-semibold block text-[10px] uppercase text-muted-foreground tracking-wider">
                    Email
                  </span>
                  {parsedData.personalInfo?.email || "N/A"}
                </div>
                <div>
                  <span className="font-semibold block text-[10px] uppercase text-muted-foreground tracking-wider">
                    {t.phone}
                  </span>
                  {parsedData.personalInfo?.phone || "N/A"}
                </div>
                <div className="col-span-2">
                  <span className="font-semibold block text-[10px] uppercase text-muted-foreground tracking-wider">
                    {t.location}
                  </span>
                  {parsedData.personalInfo?.location || "N/A"}
                </div>
              </div>

              {/* Work Experience list summary */}
              {parsedData.workExperience &&
                parsedData.workExperience.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-border/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                      {t.expSummary} ({parsedData.workExperience.length})
                    </span>
                    {parsedData.workExperience.map((exp, idx) => (
                      <div
                        key={exp.id || idx}
                        className="flex gap-2 items-start text-xs"
                      >
                        <Briefcase
                          size={12}
                          className="text-emerald-500 shrink-0 mt-0.5"
                        />
                        <div>
                          <span className="text-foreground font-semibold">
                            {exp.position}
                          </span>{" "}
                          {t.language === "vi" ? "tại" : "at"}{" "}
                          <span className="text-foreground">{exp.company}</span>
                          <span className="text-muted-foreground text-[10px] ml-1.5">
                            ({exp.startDate} -{" "}
                            {exp.endDate === "Present"
                              ? t.present
                              : exp.endDate}
                            )
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              {/* Education summary */}
              {parsedData.education && parsedData.education.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-border/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    {t.eduSummary} ({parsedData.education.length})
                  </span>
                  {parsedData.education.map((edu, idx) => (
                    <div
                      key={edu.id || idx}
                      className="flex gap-2 items-start text-xs"
                    >
                      <GraduationCap
                        size={12}
                        className="text-emerald-500 shrink-0 mt-0.5"
                      />
                      <div>
                        <span className="text-foreground font-semibold">
                          {edu.degree}
                        </span>{" "}
                        {t.language === "vi" ? "chuyên ngành" : "in"}{" "}
                        <span className="text-foreground">
                          {edu.fieldOfStudy}
                        </span>
                        <div className="text-muted-foreground text-[10px]">
                          {edu.school} ({edu.startDate} - {edu.endDate})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions for Preview */}
            <div className="flex gap-3 justify-end pt-4 border-t border-border/60 shrink-0">
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
                disabled={isLoading}
                className="border-border hover:bg-accent hover:text-accent-foreground text-foreground"
              >
                {t.backBtn}
              </Button>
              <Button
                onClick={handleApplyData}
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white dark:text-zinc-955 font-bold shadow-lg shadow-emerald-500/10"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-1.5" />
                    {t.savingText}
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} className="mr-1.5" />
                    {t.applyBtn}
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Tabs Trigger Navigation */}
            <div className="flex px-6 bg-muted/30 border-b border-border">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("pdf");
                  setError(null);
                }}
                className={`py-3 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "pdf"
                    ? "border-emerald-500 text-emerald-400 font-bold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText size={15} />
                {t.importPdfTab}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("linkedin");
                  setError(null);
                }}
                className={`py-3 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "linkedin"
                    ? "border-emerald-500 text-emerald-400 font-bold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <LinkedinIcon className="h-[15px] w-[15px] shrink-0" />
                {t.importLinkedinTab}
              </button>
            </div>

            {/* Scrollable Tab Content Container */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs sm:text-sm rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Tab 1: PDF File drag and drop */}
              {activeTab === "pdf" && (
                <div className="space-y-4">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                      isDragOver
                        ? "border-emerald-500 bg-emerald-500/5"
                        : selectedFile
                          ? "border-emerald-500/50 bg-emerald-500/5"
                          : "border-border bg-muted/10 hover:border-border/80 hover:bg-muted/20"
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf"
                      className="hidden"
                    />

                    {selectedFile ? (
                      <div className="space-y-3 flex flex-col items-center">
                        <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                          <FileText size={24} />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-foreground truncate max-w-[280px]">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                          }}
                          className="text-xs text-rose-455 hover:text-rose-300 font-medium flex items-center gap-0.5 hover:underline mt-1 cursor-pointer"
                        >
                          <X size={12} /> {t.removeFile}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 flex flex-col items-center">
                        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center border border-border text-muted-foreground group-hover:text-foreground">
                          <UploadCloud size={24} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            {t.dragDropText}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t.pdfMaxSize}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* LinkedIn PDF Export Instruction */}
                  <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
                    <h5 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <LinkedinIcon className="h-[13px] w-[13px] text-sky-450" />
                      {t.linkedinTipTitle}
                    </h5>
                    <ol className="text-[11px] text-muted-foreground list-decimal list-inside space-y-1">
                      <li>{t.linkedinTip1}</li>
                      <li>{t.linkedinTip2}</li>
                      <li>{t.linkedinTip3}</li>
                      <li>{t.linkedinTip4}</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Tab 2: LinkedIn raw text paste */}
              {activeTab === "linkedin" && (
                <div className="space-y-3 flex flex-col h-full">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
                      {t.linkedinTextLabel}
                    </label>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          setLinkedinText(text);
                          toast.success(
                            t.language === "vi"
                              ? "Đã dán văn bản từ Clipboard!"
                              : "Pasted text from Clipboard!",
                          );
                        } catch {
                          toast.error(
                            t.language === "vi"
                              ? "Không thể tự động đọc clipboard. Hãy nhấn Ctrl+V / Cmd+V."
                              : "Could not read clipboard. Please press Ctrl+V / Cmd+V.",
                          );
                        }
                      }}
                      className="text-muted-foreground hover:text-emerald-500 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Clipboard size={12} /> {t.autoPaste}
                    </button>
                  </div>

                  <textarea
                    value={linkedinText}
                    onChange={(e) => setLinkedinText(e.target.value)}
                    placeholder={t.pastePlaceholder}
                    rows={8}
                    className="w-full text-xs sm:text-sm bg-background border border-border rounded-xl p-3 focus:outline-none focus:border-emerald-500 text-foreground placeholder:text-muted-foreground resize-none"
                  />
                  <p className="text-[10px] sm:text-xs text-muted-foreground italic">
                    {t.pasteWarning}
                  </p>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <DialogFooter className="p-6 pt-4 border-t border-border bg-muted/20 shrink-0">
              <div className="flex gap-3 justify-end w-full">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="border-border hover:bg-accent hover:text-accent-foreground text-foreground"
                >
                  {t.closeBtn}
                </Button>
                <Button
                  onClick={handleImportSubmit}
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white dark:text-zinc-955 font-bold shadow-lg shadow-emerald-500/10"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-1.5" />
                      {t.extractingText}
                    </>
                  ) : (
                    <>
                      {t.extractButton}
                      <ArrowRight size={14} className="ml-1.5" />
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

'use client';

import React, { useState } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { AiSuggestionRewrite } from '@/types/resume';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Brain, Check, RefreshCw, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';

export default function AiSidebar() {
  const {
    isOptimizing,
    aiSuggestions,
    activeSuggestionsApplied,
    runAiOptimization,
    applyAiSuggestion,
    resetSuggestions
  } = useResumeStore();

  const [jdText, setJdText] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jdText.trim()) return;
    await runAiOptimization(jdText, company, role);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 50) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const formatSectionName = (path: string) => {
    const main = path.split('.')[0];
    switch (main) {
      case 'personalInfo': return 'Thông tin cá nhân';
      case 'workExperience': return 'Kinh nghiệm làm việc';
      case 'education': return 'Học vấn';
      case 'skills': return 'Kỹ năng';
      case 'projects': return 'Dự án';
      case 'languages': return 'Ngoại ngữ';
      case 'certifications': return 'Chứng chỉ';
      default: return 'Khác';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#18181b]/50 backdrop-blur-xl border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800/80 bg-[#0f0f11]/30 flex items-center gap-2 shrink-0">
        <Sparkles className="text-emerald-400" size={18} />
        <h2 className="font-bold text-zinc-100 text-base">Cố vấn Tối ưu AI (Gemini)</h2>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-5">
        {!aiSuggestions && !isOptimizing && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Nhập mô tả công việc (JD) bạn muốn ứng tuyển. Gemini sẽ phân tích CV của bạn và đưa ra đề xuất căn chỉnh tốt nhất.
            </p>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Công ty ứng tuyển</label>
              <Input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Ví dụ: VinGroup, FPT, Google..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Vị trí ứng tuyển</label>
              <Input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Ví dụ: Senior Frontend Engineer..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Mô tả công việc (JD) *</label>
              <Textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Dán toàn bộ nội dung JD vào đây để đối chiếu kỹ năng..."
                rows={8}
                required
                className="resize-none"
              />
            </div>

            <Button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-zinc-950 hover:opacity-95 shadow-lg shadow-emerald-500/10"
            >
              <Brain size={16} /> Phân tích & Tối ưu hóa
            </Button>
          </form>
        )}

        {isOptimizing && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="relative flex items-center justify-center">
              <div className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-emerald-500 opacity-20"></div>
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-r-2 border-emerald-500"></div>
            </div>
            <div className="space-y-1">
              <h4 className="text-zinc-200 font-semibold text-sm">Gemini đang phân tích</h4>
              <p className="text-xs text-zinc-500 max-w-[200px]">Đang đối chiếu CV của bạn với JD để tạo đề xuất tối ưu...</p>
            </div>
          </div>
        )}

        {aiSuggestions && !isOptimizing && (
          <div className="space-y-5">
            {/* Score & Controls Header */}
            <div className="flex justify-between items-center bg-[#0f0f11]/40 border border-zinc-800/80 p-3 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`flex flex-col items-center justify-center h-12 w-12 rounded-lg border font-mono font-bold text-lg ${getScoreColor(aiSuggestions.overallScore)}`}>
                  {aiSuggestions.overallScore}
                </div>
                <div>
                  <h4 className="text-zinc-200 font-bold text-xs">Điểm phù hợp ATS</h4>
                  <p className="text-[10px] text-zinc-500">Tối thiểu nên đạt 75+ điểm</p>
                </div>
              </div>
              
              <Button
                onClick={resetSuggestions}
                variant="secondary"
                size="sm"
                className="text-zinc-400 hover:text-zinc-200 bg-[#0f0f11]/60 px-2.5"
              >
                <RefreshCw size={12} /> Thử lại
              </Button>
            </div>

            {/* Analysis Summary */}
            <div className="space-y-1.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Đánh giá tổng quan</h3>
              <p className="text-xs text-zinc-300 bg-zinc-900/30 border border-zinc-900/80 p-3 rounded-xl leading-relaxed whitespace-pre-line">
                {aiSuggestions.analysisSummary}
              </p>
            </div>

            {/* Missing Keywords */}
            {aiSuggestions.missingKeywords?.length > 0 && (
              <div className="space-y-1.5">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <AlertTriangle size={12} className="text-amber-500" /> Từ khóa bị thiếu (JD có nhưng CV chưa có)
                </h3>
                <div className="flex flex-wrap gap-1.5 bg-zinc-900/30 border border-zinc-900/80 p-3 rounded-xl">
                  {aiSuggestions.missingKeywords.map((kw, i) => (
                    <span key={i} className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-md font-medium">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Additions */}
            {aiSuggestions.suggestedAdditions?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Đề xuất thêm mới</h3>
                <div className="space-y-2">
                  {aiSuggestions.suggestedAdditions.map((item, i) => (
                    <div key={i} className="bg-zinc-900/30 border border-zinc-850 p-3 rounded-xl space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase">
                          {formatSectionName(item.section)}
                        </span>
                      </div>
                      <p className="text-zinc-200 font-medium text-xs leading-relaxed">“{item.content}”</p>
                      <div className="text-[10px] text-zinc-500 bg-[#0f0f11]/30 p-1.5 rounded border border-zinc-900/50">
                        {item.reasoning}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Rewrites */}
            {aiSuggestions.suggestedRewrites?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Đề xuất viết lại</h3>
                <div className="space-y-3">
                  {aiSuggestions.suggestedRewrites.map((rewrite, i) => {
                    const isApplied = activeSuggestionsApplied[`${rewrite.path}-${i}`];
                    return (
                      <div key={i} className="bg-[#0f0f11]/40 border border-zinc-800/80 rounded-xl overflow-hidden text-xs">
                        {/* Rewrite Header */}
                        <div className="bg-[#0f0f11]/80 px-3 py-2 border-b border-zinc-800/80 flex justify-between items-center">
                          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                            {formatSectionName(rewrite.path)}
                          </span>
                          <span className="text-[9px] text-zinc-500 font-mono font-bold">
                            #{i + 1}
                          </span>
                        </div>

                        {/* Comparisons */}
                        <div className="p-3 space-y-3">
                          {/* Original Text */}
                          {rewrite.originalText && (
                            <div className="space-y-1">
                              <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Văn bản gốc:</span>
                              <p className="text-zinc-400 text-xs italic bg-zinc-900/20 p-2 rounded border border-zinc-900/40">
                                “{rewrite.originalText}”
                              </p>
                            </div>
                          )}

                          {/* Suggested Text */}
                          <div className="space-y-1">
                            <span className="text-[9px] font-semibold text-emerald-500 uppercase tracking-wider">Gợi ý từ AI:</span>
                            <p className="text-zinc-200 text-xs font-medium bg-emerald-500/5 p-2 rounded border border-emerald-500/10 leading-relaxed">
                              “{rewrite.suggestedText}”
                            </p>
                          </div>

                          {/* Reasoning */}
                          <div className="text-[10px] text-zinc-500 bg-[#0f0f11]/30 p-2 rounded border border-zinc-900/50 leading-relaxed">
                            <span className="font-semibold text-zinc-400">Lý do: </span>
                            {rewrite.reasoning}
                          </div>

                          {/* Action Button */}
                          <Button
                            onClick={() => applyAiSuggestion(rewrite, i)}
                            disabled={isApplied}
                            variant={isApplied ? "outline" : "default"}
                            className={`w-full py-2 ${
                              isApplied 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default hover:bg-emerald-500/10 hover:text-emerald-400' 
                                : 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400'
                            }`}
                          >
                            {isApplied ? (
                              <>
                                <CheckCircle2 size={13} /> Đã áp dụng vào bản nháp
                              </>
                            ) : (
                              <>
                                <Check size={13} /> Áp dụng gợi ý này
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

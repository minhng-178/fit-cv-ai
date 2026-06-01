'use client';

import React, { useState } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Brain, Check, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { translations } from '@/lib/i18n/translations';

export default function AiSidebar() {
  const {
    isOptimizing,
    aiSuggestions,
    activeSuggestionsApplied,
    runAiOptimization,
    applyAiSuggestion,
    resetSuggestions,
    language
  } = useResumeStore();

  const t = translations[language] || translations.vi;

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
      case 'personalInfo': return t.personalInfo;
      case 'workExperience': return t.workExperience;
      case 'education': return t.education;
      case 'skills': return t.skills;
      case 'projects': return t.projects;
      case 'languages': return t.languages;
      case 'certifications': return t.certifications;
      default: return t.aiSectionOther;
    }
  };

  return (
    <div className="h-full flex flex-col bg-card/50 backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2 shrink-0">
        <Sparkles className="text-emerald-400" size={18} />
        <h2 className="font-bold text-foreground text-base">{t.aiAdvisorTitle}</h2>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-5">
        {!aiSuggestions && !isOptimizing && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.aiAdvisorDesc}
            </p>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t.aiCompanyLabel}</label>
              <Input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder={t.aiCompanyPlaceholder}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t.aiRoleLabel}</label>
              <Input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder={t.aiRolePlaceholder}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t.aiJdLabel}</label>
              <Textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder={t.aiJdPlaceholder}
                rows={8}
                required
                className="resize-none"
              />
            </div>

            <Button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white dark:text-zinc-950 hover:opacity-95 shadow-lg shadow-emerald-500/10"
            >
              <Brain size={16} /> {t.aiBtnAnalyze}
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
              <h4 className="text-foreground font-semibold text-sm">{t.aiAnalyzingTitle}</h4>
              <p className="text-xs text-muted-foreground max-w-[200px]">{t.aiAnalyzingDesc}</p>
            </div>
          </div>
        )}

        {aiSuggestions && !isOptimizing && (
          <div className="space-y-5">
            {/* Score & Controls Header */}
            <div className="flex justify-between items-center bg-muted/10 border border-border p-3 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`flex flex-col items-center justify-center h-12 w-12 rounded-lg border font-mono font-bold text-lg ${getScoreColor(aiSuggestions.overallScore)}`}>
                  {aiSuggestions.overallScore}
                </div>
                <div>
                  <h4 className="text-foreground font-bold text-xs">{t.aiScoreLabel}</h4>
                  <p className="text-[10px] text-muted-foreground">{t.aiAtsScoreDesc}</p>
                </div>
              </div>
              
              <Button
                onClick={resetSuggestions}
                variant="secondary"
                size="sm"
                className="text-muted-foreground hover:text-foreground bg-muted/60 px-2.5"
              >
                <RefreshCw size={12} /> {t.timeMinutesAgo === 'phút trước' ? 'Thử lại' : 'Retry'}
              </Button>
            </div>

            {/* Analysis Summary */}
            <div className="space-y-1.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t.aiSuggestionsTitle}</h3>
              <p className="text-xs text-foreground bg-muted/10 border border-border p-3 rounded-xl leading-relaxed whitespace-pre-line">
                {aiSuggestions.analysisSummary}
              </p>
            </div>

            {/* Missing Keywords */}
            {aiSuggestions.missingKeywords?.length > 0 && (
              <div className="space-y-1.5">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <AlertTriangle size={12} className="text-amber-500" /> {t.aiMissingKeywordsDesc}
                </h3>
                <div className="flex flex-wrap gap-1.5 bg-muted/10 border border-border p-3 rounded-xl">
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
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t.aiAdditions}</h3>
                <div className="space-y-2">
                  {aiSuggestions.suggestedAdditions.map((item, i) => (
                    <div key={i} className="bg-muted/10 border border-border p-3 rounded-xl space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase">
                          {formatSectionName(item.section)}
                        </span>
                      </div>
                      <p className="text-foreground font-medium text-xs leading-relaxed">“{item.content}”</p>
                      <div className="text-[10px] text-muted-foreground bg-muted/20 p-1.5 rounded border border-border">
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
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t.aiRewrites}</h3>
                <div className="space-y-3">
                  {aiSuggestions.suggestedRewrites.map((rewrite, i) => {
                    const isApplied = activeSuggestionsApplied[`${rewrite.path}-${i}`];
                    return (
                      <div key={i} className="bg-muted/10 border border-border rounded-xl overflow-hidden text-xs">
                        {/* Rewrite Header */}
                        <div className="bg-muted/80 px-3 py-2 border-b border-border flex justify-between items-center">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {formatSectionName(rewrite.path)}
                          </span>
                          <span className="text-[9px] text-muted-foreground font-mono font-bold">
                            #{i + 1}
                          </span>
                        </div>

                        {/* Comparisons */}
                        <div className="p-3 space-y-3">
                          {/* Original Text */}
                          {rewrite.originalText && (
                            <div className="space-y-1">
                              <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{t.aiOriginalText}</span>
                              <p className="text-muted-foreground text-xs italic bg-muted/10 p-2 rounded border border-border">
                                “{rewrite.originalText}”
                              </p>
                            </div>
                          )}

                          {/* Suggested Text */}
                          <div className="space-y-1">
                            <span className="text-[9px] font-semibold text-emerald-500 uppercase tracking-wider">{t.aiSuggestedText}</span>
                            <p className="text-foreground text-xs font-medium bg-emerald-500/5 p-2 rounded border border-emerald-500/10 leading-relaxed">
                              “{rewrite.suggestedText}”
                            </p>
                          </div>

                          {/* Reasoning */}
                          <div className="text-[10px] text-muted-foreground bg-muted/20 p-2 rounded border border-border leading-relaxed">
                            <span className="font-semibold text-muted-foreground">{t.aiReasonLabel}</span>
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
                                : 'bg-emerald-500 text-white dark:text-zinc-950 hover:bg-emerald-400'
                            }`}
                          >
                            {isApplied ? (
                              <>
                                <CheckCircle2 size={13} /> {t.aiApplied}
                              </>
                            ) : (
                              <>
                                <Check size={13} /> {t.aiApplyThis}
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

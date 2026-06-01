'use client';

import React from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { translations } from '@/lib/i18n/translations';

export default function LayoutPanel(): React.ReactElement {
  const { resumeData, updateField, language } = useResumeStore();
  const t = translations[language] || translations.vi;

  return (
    <div className="space-y-8 animate-fade-in text-foreground">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">{t.layoutPanelTitle}</h2>
        <p className="text-sm text-muted-foreground">{t.layoutPanelDesc}</p>
      </div>

      {/* Template Selection */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.layoutStructure}</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Two Columns Left */}
          <button
            type="button"
            onClick={() => updateField('layout.template', 'two-columns-left')}
            className={`flex flex-col gap-2 p-3.5 rounded-xl border text-left transition-all duration-300 ${
              (resumeData.layout?.template || 'two-columns-left') === 'two-columns-left'
                ? 'border-emerald-500 bg-emerald-500/5 text-foreground shadow-md shadow-emerald-500/10'
                : 'border-border bg-muted/40 text-muted-foreground hover:border-border/80 hover:text-foreground'
            }`}
          >
            <div className="w-full h-20 bg-background border border-border rounded-lg p-1.5 flex gap-1">
              <div className="w-2/3 h-full bg-muted/60 rounded flex flex-col gap-1 p-1">
                <div className="w-3/4 h-2 bg-emerald-500/45 rounded-sm"></div>
                <div className="w-full h-1 bg-muted/40 rounded-sm"></div>
                <div className="w-5/6 h-1 bg-muted/40 rounded-sm"></div>
              </div>
              <div className="w-1/3 h-full bg-muted/30 border-l border-border rounded p-1 flex flex-col gap-1">
                <div className="w-full h-2 bg-muted/40 rounded-sm"></div>
                <div className="w-2/3 h-1 bg-muted/40 rounded-sm"></div>
              </div>
            </div>
            <div className="text-xs font-semibold">{t.layoutTwoColsLeft}</div>
            <div className="text-[10px] text-muted-foreground leading-normal">{t.layoutTwoColsLeftDesc}</div>
          </button>

          {/* Two Columns Right */}
          <button
            type="button"
            onClick={() => updateField('layout.template', 'two-columns-right')}
            className={`flex flex-col gap-2 p-3.5 rounded-xl border text-left transition-all duration-300 ${
              resumeData.layout?.template === 'two-columns-right'
                ? 'border-emerald-500 bg-emerald-500/5 text-foreground shadow-md shadow-emerald-500/10'
                : 'border-border bg-muted/40 text-muted-foreground hover:border-border/80 hover:text-foreground'
            }`}
          >
            <div className="w-full h-20 bg-background border border-border rounded-lg p-1.5 flex gap-1">
              <div className="w-1/3 h-full bg-muted/30 border-r border-border rounded p-1 flex flex-col gap-1">
                <div className="w-full h-2 bg-muted/40 rounded-sm"></div>
                <div className="w-2/3 h-1 bg-muted/40 rounded-sm"></div>
              </div>
              <div className="w-2/3 h-full bg-muted/60 rounded flex flex-col gap-1 p-1">
                <div className="w-3/4 h-2 bg-emerald-500/45 rounded-sm"></div>
                <div className="w-full h-1 bg-muted/40 rounded-sm"></div>
                <div className="w-5/6 h-1 bg-muted/40 rounded-sm"></div>
              </div>
            </div>
            <div className="text-xs font-semibold">{t.layoutTwoColsRight}</div>
            <div className="text-[10px] text-muted-foreground leading-normal">{t.layoutTwoColsRightDesc}</div>
          </button>

          {/* Single Column */}
          <button
            type="button"
            onClick={() => updateField('layout.template', 'single-column')}
            className={`flex flex-col gap-2 p-3.5 rounded-xl border text-left transition-all duration-300 ${
              resumeData.layout?.template === 'single-column'
                ? 'border-emerald-500 bg-emerald-500/5 text-foreground shadow-md shadow-emerald-500/10'
                : 'border-border bg-muted/40 text-muted-foreground hover:border-border/80 hover:text-foreground'
            }`}
          >
            <div className="w-full h-20 bg-background border border-border rounded-lg p-1.5 flex flex-col gap-1">
              <div className="w-full h-full bg-muted/40 rounded flex flex-col gap-1 p-1">
                <div className="w-1/2 h-2 bg-emerald-500/45 rounded-sm"></div>
                <div className="w-full h-1 bg-muted/40 rounded-sm"></div>
                <div className="w-11/12 h-1 bg-muted/40 rounded-sm"></div>
                <div className="w-3/4 h-2 bg-muted/40 rounded-sm mt-1"></div>
                <div className="w-5/6 h-1 bg-muted/40 rounded-sm"></div>
              </div>
            </div>
            <div className="text-xs font-semibold">{t.layoutOneCol}</div>
            <div className="text-[10px] text-muted-foreground leading-normal">{t.layoutOneColDesc}</div>
          </button>
        </div>
      </div>

      {/* Color Scheme */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.layoutAccentColor}</label>
        <div className="flex flex-wrap gap-3">
          {[
            { id: 'emerald', label: 'Emerald Green', bgClass: 'bg-emerald-500 border-emerald-500/50 shadow-emerald-500/20' },
            { id: 'blue', label: 'Ocean Blue', bgClass: 'bg-blue-500 border-blue-500/50 shadow-blue-500/20' },
            { id: 'indigo', label: 'Deep Indigo', bgClass: 'bg-indigo-500 border-indigo-500/50 shadow-indigo-500/20' },
            { id: 'rose', label: 'Crimson Rose', bgClass: 'bg-rose-500 border-rose-500/50 shadow-rose-500/20' },
            { id: 'slate', label: 'Slate Gray', bgClass: 'bg-zinc-500 border-zinc-500/50 shadow-zinc-500/20' },
          ].map((color) => {
            const isSelected = (resumeData.layout?.themeColor || 'emerald') === color.id;
            return (
              <button
                key={color.id}
                type="button"
                onClick={() => updateField('layout.themeColor', color.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all duration-300 ${
                  isSelected
                    ? 'border-foreground bg-muted text-foreground shadow-sm'
                    : 'border-border bg-muted/30 text-muted-foreground hover:border-border/80 hover:text-foreground'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full ${color.bgClass} border`}></span>
                {color.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Font Family */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.layoutTypography}</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'sans', name: 'Sans-serif', desc: 'Inter, Roboto', styleClass: 'font-sans' },
            { id: 'serif', name: 'Serif', desc: 'Playfair, Georgia', styleClass: 'font-serif' },
            { id: 'display', name: 'Display', desc: 'Outfit, Lexend', styleClass: 'font-sans tracking-tight' }
          ].map((font) => {
            const isSelected = (resumeData.layout?.fontFamily || 'sans') === font.id;
            return (
              <button
                key={font.id}
                type="button"
                onClick={() => updateField('layout.fontFamily', font.id)}
                className={`flex flex-col gap-1 p-3.5 rounded-xl border text-left transition-all duration-300 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/5 text-foreground'
                    : 'border-border bg-muted/40 text-muted-foreground hover:border-border/80 hover:text-foreground'
                }`}
              >
                <div className={`text-sm font-bold ${font.styleClass}`}>{font.name}</div>
                <div className="text-[10px] text-muted-foreground">
                  {language === 'vi' ? `Phông chữ ${font.desc} hiện đại và trực quan.` : `Modern and intuitive ${font.desc} typeface.`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Font Size */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.layoutFontSize}</label>
        <div className="flex gap-2 p-1 bg-background border border-border rounded-xl max-w-sm">
          {[
            { id: 'sm', label: t.layoutFontSizeSm, desc: t.layoutFontSizeSmDesc },
            { id: 'md', label: t.layoutFontSizeMd, desc: t.layoutFontSizeMdDesc },
            { id: 'lg', label: t.layoutFontSizeLg, desc: t.layoutFontSizeLgDesc },
          ].map((size) => {
            const isSelected = (resumeData.layout?.fontSize || 'md') === size.id;
            return (
              <button
                key={size.id}
                type="button"
                onClick={() => updateField('layout.fontSize', size.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 px-3 rounded-lg text-xs font-semibold transition-all duration-300 ${
                  isSelected
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
                }`}
              >
                <span>{size.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

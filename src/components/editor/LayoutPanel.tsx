'use client';

import React from 'react';
import { useResumeStore } from '@/store/useResumeStore';

export default function LayoutPanel(): React.ReactElement {
  const { resumeData, updateField } = useResumeStore();

  return (
    <div className="space-y-8 animate-fade-in text-zinc-100">
      <div>
        <h2 className="text-xl font-bold text-zinc-100 mb-1">Bố cục & Giao diện</h2>
        <p className="text-sm text-zinc-400">Tùy chỉnh phong cách hiển thị và cách sắp xếp thông tin trên CV theo sở thích.</p>
      </div>

      {/* Template Selection */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Cấu trúc bố cục (Template)</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Two Columns Left */}
          <button
            type="button"
            onClick={() => updateField('layout.template', 'two-columns-left')}
            className={`flex flex-col gap-2 p-3.5 rounded-xl border text-left transition-all duration-300 ${
              (resumeData.layout?.template || 'two-columns-left') === 'two-columns-left'
                ? 'border-emerald-500 bg-emerald-500/5 text-zinc-100 shadow-md shadow-emerald-950/20'
                : 'border-zinc-800 bg-[#0f0f11]/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
            }`}
          >
            <div className="w-full h-20 bg-zinc-950 border border-zinc-800/80 rounded-lg p-1.5 flex gap-1">
              <div className="w-2/3 h-full bg-zinc-800/60 rounded flex flex-col gap-1 p-1">
                <div className="w-3/4 h-2 bg-emerald-500/45 rounded-sm"></div>
                <div className="w-full h-1 bg-zinc-700/40 rounded-sm"></div>
                <div className="w-5/6 h-1 bg-zinc-700/40 rounded-sm"></div>
              </div>
              <div className="w-1/3 h-full bg-zinc-800/30 border-l border-zinc-800/80 rounded p-1 flex flex-col gap-1">
                <div className="w-full h-2 bg-zinc-700/40 rounded-sm"></div>
                <div className="w-2/3 h-1 bg-zinc-700/40 rounded-sm"></div>
              </div>
            </div>
            <div className="text-xs font-semibold">2 Cột (Chính trái, Phụ phải)</div>
            <div className="text-[10px] text-zinc-500 leading-normal">Mặc định chuyên nghiệp, tối ưu không gian hiển thị thông tin chính.</div>
          </button>

          {/* Two Columns Right */}
          <button
            type="button"
            onClick={() => updateField('layout.template', 'two-columns-right')}
            className={`flex flex-col gap-2 p-3.5 rounded-xl border text-left transition-all duration-300 ${
              resumeData.layout?.template === 'two-columns-right'
                ? 'border-emerald-500 bg-emerald-500/5 text-zinc-100 shadow-md shadow-emerald-950/20'
                : 'border-zinc-800 bg-[#0f0f11]/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
            }`}
          >
            <div className="w-full h-20 bg-zinc-950 border border-zinc-800/80 rounded-lg p-1.5 flex gap-1">
              <div className="w-1/3 h-full bg-zinc-800/30 border-r border-zinc-800/80 rounded p-1 flex flex-col gap-1">
                <div className="w-full h-2 bg-zinc-700/40 rounded-sm"></div>
                <div className="w-2/3 h-1 bg-zinc-700/40 rounded-sm"></div>
              </div>
              <div className="w-2/3 h-full bg-zinc-800/60 rounded flex flex-col gap-1 p-1">
                <div className="w-3/4 h-2 bg-emerald-500/45 rounded-sm"></div>
                <div className="w-full h-1 bg-zinc-700/40 rounded-sm"></div>
                <div className="w-5/6 h-1 bg-zinc-700/40 rounded-sm"></div>
              </div>
            </div>
            <div className="text-xs font-semibold">2 Cột (Phụ trái, Chính phải)</div>
            <div className="text-[10px] text-zinc-500 leading-normal">Layout hiện đại, tập trung sự chú ý của nhà tuyển dụng vào cột thông tin phụ trước.</div>
          </button>

          {/* Single Column */}
          <button
            type="button"
            onClick={() => updateField('layout.template', 'single-column')}
            className={`flex flex-col gap-2 p-3.5 rounded-xl border text-left transition-all duration-300 ${
              resumeData.layout?.template === 'single-column'
                ? 'border-emerald-500 bg-emerald-500/5 text-zinc-100 shadow-md shadow-emerald-950/20'
                : 'border-zinc-800 bg-[#0f0f11]/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
            }`}
          >
            <div className="w-full h-20 bg-zinc-950 border border-zinc-800/80 rounded-lg p-1.5 flex flex-col gap-1">
              <div className="w-full h-full bg-zinc-800/40 rounded flex flex-col gap-1 p-1">
                <div className="w-1/2 h-2 bg-emerald-500/45 rounded-sm"></div>
                <div className="w-full h-1 bg-zinc-700/40 rounded-sm"></div>
                <div className="w-11/12 h-1 bg-zinc-700/40 rounded-sm"></div>
                <div className="w-3/4 h-2 bg-zinc-700/40 rounded-sm mt-1"></div>
                <div className="w-5/6 h-1 bg-zinc-700/40 rounded-sm"></div>
              </div>
            </div>
            <div className="text-xs font-semibold">1 Cột (Cổ điển)</div>
            <div className="text-[10px] text-zinc-500 leading-normal">Đơn giản, truyền thống và tương thích hoàn hảo nhất với các hệ thống quét ATS tự động.</div>
          </button>
        </div>
      </div>

      {/* Color Scheme */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Màu sắc chủ đạo (Accent Color)</label>
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
                    ? 'border-zinc-300 bg-[#1f1f23] text-zinc-100 shadow-lg'
                    : 'border-zinc-800 bg-[#0f0f11]/30 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
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
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Phông chữ hiển thị (Typography)</label>
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
                    ? 'border-emerald-500 bg-emerald-500/5 text-zinc-100'
                    : 'border-zinc-800 bg-[#0f0f11]/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className={`text-sm font-bold ${font.styleClass}`}>{font.name}</div>
                <div className="text-[10px] text-zinc-500">Phông chữ {font.desc} hiện đại và trực quan.</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Font Size */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Cỡ chữ (Font Size)</label>
        <div className="flex gap-2 p-1 bg-zinc-950 border border-zinc-800/80 rounded-xl max-w-sm">
          {[
            { id: 'sm', label: 'Nhỏ (10px)', desc: 'Tối ưu cho CV dài' },
            { id: 'md', label: 'Vừa (11px)', desc: 'Kích thước tiêu chuẩn' },
            { id: 'lg', label: 'Lớn (12px)', desc: 'Dễ đọc, rõ ràng' },
          ].map((size) => {
            const isSelected = (resumeData.layout?.fontSize || 'md') === size.id;
            return (
              <button
                key={size.id}
                type="button"
                onClick={() => updateField('layout.fontSize', size.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 px-3 rounded-lg text-xs font-semibold transition-all duration-300 ${
                  isSelected
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
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

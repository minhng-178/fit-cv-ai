'use client';

import * as React from 'react';
import { X, Plus, Search, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api-client';
import { FormContext } from '@/components/ui/generic-form';
import { get as lodashGet } from 'lodash';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SkillOption {
  _id?: string;
  name: string;
  category?: string;
  usageCount?: number;
}

interface SkillSelectorProps {
  /** Current selected skill names (string[]) */
  value: string[];
  /** Called when the list changes */
  onChange: (skills: string[]) => void;
  /** Label shown above the selector */
  label?: string;
  /** CSS class applied to the wrapper div */
  className?: string;
  /** Placeholder text inside the search input */
  placeholder?: string;
  /** Whether form field is required */
  required?: boolean;
}

// ---------------------------------------------------------------------------
// Debounce helper
// ---------------------------------------------------------------------------

function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ---------------------------------------------------------------------------
// SkillSelector — standalone tag-based combobox
// ---------------------------------------------------------------------------

export function SkillSelector({
  value = [],
  onChange,
  label = 'Kỹ năng',
  className,
  placeholder = 'Tìm hoặc thêm kỹ năng...',
  required,
}: SkillSelectorProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<SkillOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);

  const debouncedQuery = useDebounce(inputValue, 250);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // ---------- fetch suggestions ----------
  React.useEffect(() => {
    let cancelled = false;

    const fetchSkills = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get('/api/skills', {
          params: { q: debouncedQuery },
        });
        if (!cancelled) {
          const filtered = (res.data.skills as SkillOption[]).filter(
            (s) => !value.includes(s.name)
          );
          setSuggestions(filtered);
        }
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchSkills();
    }

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, isOpen, value]);

  // ---------- close on outside click ----------
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ---------- add skill ----------
  const addSkill = async (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed || value.includes(trimmed)) return;

    onChange([...value, trimmed]);
    setInputValue('');
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();

    // Persist to DB (fire & forget)
    try {
      await apiClient.post('/api/skills', { name: trimmed });
    } catch {
      // Non-critical
    }
  };

  // ---------- remove skill ----------
  const removeSkill = (skillName: string) => {
    onChange(value.filter((s) => s !== skillName));
    inputRef.current?.focus();
  };

  // ---------- keyboard navigation ----------
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const items = [
      ...suggestions,
      ...(inputValue.trim() &&
      !suggestions.some(
        (s) => s.name.toLowerCase() === inputValue.trim().toLowerCase()
      )
        ? [{ name: inputValue.trim(), _isNew: true } as SkillOption & { _isNew: boolean }]
        : []),
    ];

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && items[activeIndex]) {
        addSkill(items[activeIndex].name);
      } else if (inputValue.trim()) {
        addSkill(inputValue.trim());
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeSkill(value[value.length - 1]);
    } else if (e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) addSkill(inputValue.trim());
    }
  };

  // Build dropdown items
  const hasNewEntry =
    inputValue.trim() &&
    !suggestions.some(
      (s) => s.name.toLowerCase() === inputValue.trim().toLowerCase()
    ) &&
    !value.includes(inputValue.trim());

  const dropdownItems: (SkillOption & { _isNew?: boolean })[] = [
    ...suggestions,
    ...(hasNewEntry ? [{ name: inputValue.trim(), _isNew: true }] : []),
  ];

  return (
    <div className={cn('space-y-1.5 relative', className)} ref={wrapperRef}>
      {/* Label */}
      {label && (
        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      {/* Tag + Input Container */}
      <div
        className={cn(
          'flex flex-wrap gap-1.5 min-h-[42px] w-full rounded-xl',
          'border border-zinc-800 bg-[#0c0c0e]/50 px-2.5 py-2 pr-8',
          'shadow-inner transition-all duration-300 cursor-text',
          isOpen
            ? 'border-emerald-500/50 ring-1 ring-emerald-500/30'
            : 'hover:border-zinc-700'
        )}
        onClick={() => {
          inputRef.current?.focus();
          setIsOpen(true);
        }}
      >
        {/* Skill Tags */}
        {value.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium
              bg-emerald-500/15 text-emerald-300 border border-emerald-500/25
              hover:bg-emerald-500/25 transition-colors"
          >
            {skill}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeSkill(skill);
              }}
              className="rounded-full opacity-60 hover:opacity-100 hover:bg-emerald-500/20 transition-all p-0.5 -mr-0.5"
              aria-label={`Xóa ${skill}`}
            >
              <X size={10} />
            </button>
          </span>
        ))}

        {/* Search Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 outline-none border-none"
        />

        {/* Right Icon */}
        <div className="absolute right-2.5 top-3 flex items-center gap-1 pointer-events-none">
          {isLoading ? (
            <Loader2 size={13} className="text-zinc-500 animate-spin" />
          ) : (
            <ChevronDown
              size={13}
              className={cn('text-zinc-600 transition-transform duration-200', isOpen && 'rotate-180')}
            />
          )}
        </div>
      </div>

      {/* Hint */}
      <p className="text-[11px] text-zinc-600 pl-0.5">
        Nhấn <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-500 text-[10px]">Enter</kbd> hoặc{' '}
        <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-500 text-[10px]">,</kbd> để thêm • Xóa bằng{' '}
        <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-500 text-[10px]">Backspace</kbd>
      </p>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute z-50 left-0 right-0 rounded-xl border border-zinc-800',
            'bg-[#0f0f12] shadow-2xl shadow-black/60 overflow-hidden',
            'animate-in fade-in-0 zoom-in-95 duration-150'
          )}
        >
          {dropdownItems.length === 0 && !isLoading && (
            <div className="px-4 py-3 text-sm text-zinc-500 text-center">
              {inputValue.trim()
                ? 'Không có trong database — nhấn Enter để thêm mới'
                : 'Bắt đầu gõ để tìm kiếm kỹ năng...'}
            </div>
          )}

          {isLoading && dropdownItems.length === 0 && (
            <div className="px-4 py-3 flex items-center justify-center gap-2 text-sm text-zinc-500">
              <Loader2 size={14} className="animate-spin" /> Đang tìm kiếm...
            </div>
          )}

          <ul className="max-h-52 overflow-y-auto py-1">
            {dropdownItems.map((item, idx) => (
              <li key={`${item.name}-${idx}`}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addSkill(item.name);
                  }}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left transition-colors duration-100',
                    activeIndex === idx
                      ? 'bg-emerald-500/10 text-emerald-300'
                      : 'text-zinc-300 hover:bg-zinc-800/60'
                  )}
                >
                  {item._isNew ? (
                    <>
                      <Plus size={13} className="text-emerald-400 shrink-0" />
                      <span>
                        Thêm mới{' '}
                        <strong className="text-emerald-400">"{item.name}"</strong>
                      </span>
                    </>
                  ) : (
                    <>
                      <Search size={12} className="text-zinc-600 shrink-0" />
                      <span className="flex-1">{item.name}</span>
                      {item.category && (
                        <span className="text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded-md shrink-0">
                          {item.category}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FormSkillSelector — drop-in for GenericForm context
// ---------------------------------------------------------------------------

export interface FormSkillSelectorProps {
  name: string;
  label?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

/**
 * Drop-in replacement for <FormTextField isArray />.
 * Must be used inside a <GenericForm> context.
 */
export function FormSkillSelector({
  name,
  label,
  className,
  placeholder,
  required,
}: FormSkillSelectorProps): React.ReactElement {
  const context = React.useContext(FormContext);
  if (!context) {
    throw new Error('FormSkillSelector must be used within a GenericForm component');
  }

  const { pathPrefix, updateField, resumeData } = context;
  const fullPath = pathPrefix ? `${pathPrefix}.${name}` : name;
  const rawValue = lodashGet(resumeData, fullPath);
  const skills: string[] = Array.isArray(rawValue) ? rawValue : [];

  return (
    <SkillSelector
      value={skills}
      onChange={(updated) => updateField(fullPath, updated)}
      label={label}
      className={className}
      placeholder={placeholder}
      required={required}
    />
  );
}

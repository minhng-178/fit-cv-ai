'use client';

import * as React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  hasError?: boolean;
}

export function DatePicker({ value, onChange, placeholder = 'YYYY/MM', className, disabled, hasError }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse initial value (could be YYYY/MM, dd/mm/yyyy, yyyy-mm, yyyy, or empty)
  const parseDate = (val: string): Date => {
    if (!val) return new Date();
    
    // Check if format is YYYY/MM or dd/mm/yyyy
    if (val.includes('/')) {
      const parts = val.split('/');
      if (parts.length === 2) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1; // 0-indexed
        if (!isNaN(y) && !isNaN(m) && m >= 0 && m < 12) {
          return new Date(y, m, 1);
        }
      }
      if (parts.length === 3) {
        // Fallback for dd/mm/yyyy (parts: [d, m, y])
        const m = parseInt(parts[1], 10) - 1;
        const y = parseInt(parts[2], 10);
        if (!isNaN(m) && !isNaN(y) && m >= 0 && m < 12) {
          return new Date(y, m, 1);
        }
      }
    }
    
    // Check if format is YYYY-MM
    if (val.includes('-')) {
      const parts = val.split('-');
      if (parts.length === 2) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        if (!isNaN(y) && !isNaN(m) && m >= 0 && m < 12) {
          return new Date(y, m, 1);
        }
      }
    }

    // Check if format is YYYY
    const year = parseInt(val, 10);
    if (!isNaN(year) && val.length === 4) {
      return new Date(year, 0, 1);
    }

    return new Date();
  };

  const selectedDate = React.useMemo(() => (value ? parseDate(value) : null), [value]);

  // Calendar View State
  const [currentDate, setCurrentDate] = React.useState(() => selectedDate || new Date());

  React.useEffect(() => {
    if (selectedDate) {
      setCurrentDate(selectedDate);
    }
  }, [selectedDate]);

  const year = currentDate.getFullYear();

  const handleYearChange = (newYear: number) => {
    setCurrentDate(new Date(newYear, currentDate.getMonth(), 1));
  };

  const handleMonthSelect = (monthIdx: number) => {
    const monthStr = String(monthIdx + 1).padStart(2, '0');
    const yearStr = String(year);
    onChange(`${yearStr}/${monthStr}`);
    setOpen(false);
  };

  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  // Year range from currentYear + 10 to currentYear - 60
  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yList = [];
    for (let y = currentYear + 5; y >= currentYear - 50; y--) {
      yList.push(y);
    }
    return yList;
  }, []);

  return (
    <div className={cn('relative w-full flex items-center', className)}>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn("pr-10", hasError && 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30')}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="absolute right-1 text-zinc-400 hover:text-zinc-200 h-8 w-8 hover:bg-transparent"
          >
            <CalendarIcon size={15} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 bg-popover border border-border text-popover-foreground p-3 select-none" align="end">
          {/* Header */}
          <div className="flex justify-between items-center gap-1 mb-3">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => handleYearChange(year - 1)}
              className="h-7 w-7 text-zinc-400 hover:text-zinc-200 hover:bg-muted p-0 flex items-center justify-center"
            >
              <ChevronLeft size={16} />
            </Button>

            {/* Year Selector */}
            <select
              value={year}
              onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
              className="bg-background border border-input rounded-lg px-2 py-1 text-xs font-semibold text-foreground focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => handleYearChange(year + 1)}
              className="h-7 w-7 text-zinc-400 hover:text-zinc-200 hover:bg-muted p-0 flex items-center justify-center"
            >
              <ChevronRight size={16} />
            </Button>
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-3 gap-2">
            {months.map((m, idx) => {
              const isSelected = selectedDate && 
                selectedDate.getMonth() === idx && 
                selectedDate.getFullYear() === year;

              const isCurrent = new Date().getMonth() === idx &&
                new Date().getFullYear() === year;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleMonthSelect(idx)}
                  className={cn(
                    'h-10 rounded-lg text-xs font-medium transition-all flex items-center justify-center',
                    isSelected 
                      ? 'bg-emerald-500 text-white dark:text-zinc-950 font-bold' 
                      : isCurrent
                      ? 'border border-emerald-500/50 text-emerald-400 bg-emerald-500/5'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

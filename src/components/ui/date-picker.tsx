'use client';

import * as React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
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

export function DatePicker({ value, onChange, placeholder = 'dd/mm/yyyy', className, disabled, hasError }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse initial value (could be dd/mm/yyyy, yyyy-mm, yyyy, or empty)
  const parseDate = (val: string): Date => {
    if (!val) return new Date();
    
    // Check if format is dd/mm/yyyy
    if (val.includes('/')) {
      const parts = val.split('/');
      if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1; // 0-indexed
        const y = parseInt(parts[2], 10);
        if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
          return new Date(y, m, d);
        }
      }
    }
    
    // Check if format is YYYY-MM
    if (val.includes('-')) {
      const parts = val.split('-');
      if (parts.length === 2) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        if (!isNaN(y) && !isNaN(m)) {
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
  const month = currentDate.getMonth();

  const handleMonthChange = (newMonth: number) => {
    setCurrentDate(new Date(year, newMonth, 1));
  };

  const handleYearChange = (newYear: number) => {
    setCurrentDate(new Date(newYear, month, 1));
  };

  const handleDateSelect = (day: number) => {
    const d = new Date(year, month, day);
    const dayStr = String(d.getDate()).padStart(2, '0');
    const monthStr = String(d.getMonth() + 1).padStart(2, '0');
    const yearStr = String(d.getFullYear());
    onChange(`${dayStr}/${monthStr}/${yearStr}`);
    setOpen(false);
  };

  // Generate calendar days
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const days = [];
  // Empty slots for previous month's padding
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

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
            {/* Month Selector */}
            <select
              value={month}
              onChange={(e) => handleMonthChange(parseInt(e.target.value, 10))}
              className="bg-background border border-input rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {months.map((m, idx) => (
                <option key={idx} value={idx}>{m}</option>
              ))}
            </select>

            {/* Year Selector */}
            <select
              value={year}
              onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
              className="bg-background border border-input rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[10px] text-muted-foreground font-bold uppercase">
            <span>CN</span>
            <span>T2</span>
            <span>T3</span>
            <span>T4</span>
            <span>T5</span>
            <span>T6</span>
            <span>T7</span>
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} />;
              }
              const isSelected = selectedDate && 
                selectedDate.getDate() === day && 
                selectedDate.getMonth() === month && 
                selectedDate.getFullYear() === year;

              const isToday = new Date().getDate() === day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={cn(
                    'h-7 w-7 rounded-lg text-xs font-medium transition-all flex items-center justify-center',
                    isSelected 
                      ? 'bg-emerald-500 text-white dark:text-zinc-950 font-bold' 
                      : isToday
                      ? 'border border-emerald-500/50 text-emerald-400 bg-emerald-500/5'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

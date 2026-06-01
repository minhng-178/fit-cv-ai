import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(
  dateStr: string,
  language: 'vi' | 'en' = 'vi',
  t: Record<string, string>,
): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t.timeJustNow;
  if (diffMins < 60) return `${diffMins} ${t.timeMinutesAgo}`;
  if (diffHours < 24) return `${diffHours} ${t.timeHoursAgo}`;
  if (diffDays < 30) return `${diffDays} ${t.timeDaysAgo}`;
  return date.toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN');
}

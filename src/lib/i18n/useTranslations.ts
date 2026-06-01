'use client';

import { useResumeStore } from '@/store/useResumeStore';
import { translations } from './translations';

/** Returns the translation table for the currently selected language. */
export function useTranslations() {
  const language = useResumeStore((s) => s.language);
  return translations[language] || translations.vi;
}

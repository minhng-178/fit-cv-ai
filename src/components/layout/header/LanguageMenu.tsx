'use client';

import { Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useResumeStore } from '@/store/useResumeStore';
import { useTranslations } from '@/lib/i18n/useTranslations';

export default function LanguageMenu() {
  const t = useTranslations();
  const { language, setLanguage } = useResumeStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent hover:border-border rounded-xl cursor-pointer"
          title={t.language}
        >
          <Globe size={15} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">{t.language}</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-850" />
        <DropdownMenuItem onClick={() => setLanguage('vi')} className="flex items-center justify-between cursor-pointer focus:bg-zinc-900 focus:text-zinc-100 text-xs py-2 px-3">
          <span>Tiếng Việt</span>
          {language === 'vi' && <Check size={14} className="text-emerald-400" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('en')} className="flex items-center justify-between cursor-pointer focus:bg-zinc-900 focus:text-zinc-100 text-xs py-2 px-3">
          <span>English</span>
          {language === 'en' && <Check size={14} className="text-emerald-400" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

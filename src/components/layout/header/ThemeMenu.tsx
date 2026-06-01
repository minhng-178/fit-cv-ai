'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Check, Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations } from '@/lib/i18n/useTranslations';

export default function ThemeMenu() {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch: the active theme is only known on the client.
  if (!mounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent hover:border-border rounded-xl cursor-pointer"
          title={t.theme}
        >
          {theme === 'dark' ? <Moon size={15} /> : theme === 'light' ? <Sun size={15} /> : <Monitor size={15} />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">{t.theme}</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-850" />
        <DropdownMenuItem onClick={() => setTheme('light')} className="flex items-center justify-between cursor-pointer focus:bg-zinc-900 focus:text-zinc-100 text-xs py-2 px-3">
          <div className="flex items-center gap-2"><Sun size={13} /><span>{t.themeLight}</span></div>
          {theme === 'light' && <Check size={14} className="text-emerald-400" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="flex items-center justify-between cursor-pointer focus:bg-zinc-900 focus:text-zinc-100 text-xs py-2 px-3">
          <div className="flex items-center gap-2"><Moon size={13} /><span>{t.themeDark}</span></div>
          {theme === 'dark' && <Check size={14} className="text-emerald-400" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className="flex items-center justify-between cursor-pointer focus:bg-zinc-900 focus:text-zinc-100 text-xs py-2 px-3">
          <div className="flex items-center gap-2"><Monitor size={13} /><span>{t.themeSystem}</span></div>
          {theme === 'system' && <Check size={14} className="text-emerald-400" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

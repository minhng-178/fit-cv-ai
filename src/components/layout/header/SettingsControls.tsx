'use client';

import { UserButton } from '@clerk/nextjs';
import LanguageMenu from './LanguageMenu';
import ThemeMenu from './ThemeMenu';

// System controls shown on every header: language, theme and the auth button.
export default function SettingsControls() {
  return (
    <div className="flex items-center gap-1">
      <LanguageMenu />
      <ThemeMenu />

      <div className="flex items-center justify-center h-9 w-9">
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: 'h-9 w-9 border border-emerald-500/25 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-500',
              userButtonTrigger: 'h-9 w-9 rounded-full',
            },
          }}
        />
      </div>
    </div>
  );
}

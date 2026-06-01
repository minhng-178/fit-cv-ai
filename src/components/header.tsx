'use client';

import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

export function Header() {
  return (
    <header className="flex justify-end items-center p-4 gap-4 h-16 bg-background/50 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <Show when="signed-out">
        <SignInButton>
          <button className="text-sm sm:text-base font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            Sign In
          </button>
        </SignInButton>
        <SignUpButton>
          <button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer transition-all duration-200">
            Sign Up
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton 
          appearance={{
            elements: {
              userButtonAvatarBox: "h-9 w-9 border border-border"
            }
          }}
        />
      </Show>
    </header>
  );
}

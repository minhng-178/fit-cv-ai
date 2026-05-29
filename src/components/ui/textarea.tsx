import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'min-h-[60px] w-full rounded-xl bg-[#0f0f11]/60 border border-zinc-800/80 px-4 py-2.5 text-zinc-200 placeholder-zinc-650 text-sm transition-all focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };

import React from 'react';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`flex w-full rounded-xl border border-slate-200 bg-white text-[15px] text-slate-800 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 resize-y p-4 outline-none transition-all custom-scrollbar ${className}`}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

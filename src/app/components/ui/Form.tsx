import React from 'react';
import { cn, filterFigmaProps } from './utils';

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-xl border border-input bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
        className
      )}
      {...filterFigmaProps(props)}
    />
  );
};

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-input bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
        className
      )}
      {...filterFigmaProps(props)}
    />
  );
};

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className, children, ...props }) => {
  return (
    <div className="relative">
      <select
        className={cn(
          "flex h-10 w-full appearance-none rounded-xl border border-input bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all pr-8",
          className
        )}
        {...filterFigmaProps(props)}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </div>
  );
};

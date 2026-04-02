import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline' | 'purple' | 'gold';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => {
  const variants = {
    default: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    warning: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    error: "bg-destructive/10 text-destructive border border-destructive/20",
    outline: "bg-transparent border border-border text-foreground",
    purple: "bg-purple-500/10 text-purple-300 border border-purple-500/20",
    gold: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
  };

  return (
    <span className={clsx(
      variants[variant],
      "border-0",
      className
    )}>
      {children}
    </span>
  );
};

import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';
import { filterFigmaProps } from './utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/2",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
    outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground text-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground text-muted-foreground hover:text-foreground",
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
    gold: "bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-purple-950 font-semibold shadow-lg shadow-amber-900/2 border border-amber-300/20"
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2",
    lg: "h-12 px-8 text-lg",
    icon: "h-10 w-10 p-0"
  };

  return (
    <button
      ref={ref}
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...filterFigmaProps(props)}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = "Button";

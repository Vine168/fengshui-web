import React from 'react';
import clsx from 'clsx';
import { motion } from 'motion/react';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onCheckedChange, className, disabled }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={clsx(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-input",
        className
      )}
    >
      <motion.span
        className={clsx(
          "pointer-events-none block h-5 w-5 rounded-full bg-primary-foreground shadow-lg ring-0 transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
};

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Filters out Figma-specific props that cause React warnings when passed to DOM elements.
 * This is particularly important for Radix components using asChild.
 */
export function filterFigmaProps<T extends Record<string, any>>(props: T): T {
  const filtered: any = {};
  for (const [key, value] of Object.entries(props)) {
    if (!key.startsWith('_fg') && key !== '%s') {
      filtered[key] = value;
    }
  }
  return filtered as T;
}

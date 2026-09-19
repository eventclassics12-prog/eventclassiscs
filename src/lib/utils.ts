import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge class names with Tailwind's conflict-aware merge. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Zero-pad a non-negative integer to two digits ("3" → "03"). */
export function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

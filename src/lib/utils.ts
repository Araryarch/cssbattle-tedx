import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRankTitle(score: number, role?: string) {
    if (role === 'admin') return 'dev';
    if (score >= 15000) return "1grid";
    if (score >= 10000) return "1flex";
    if (score >= 7500) return "2flex";
    if (score >= 5000) return "3flex";
    if (score >= 3500) return "4flex";
    if (score >= 2000) return "5flex";
    if (score >= 1000) return "6flex";
    if (score >= 500) return "7flex";
    return "8flex";
}

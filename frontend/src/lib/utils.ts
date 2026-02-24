import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Frequency } from '../backend';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert nanoseconds (bigint) to JS Date
export function nsToDate(ns: bigint): Date {
  return new Date(Number(ns / 1_000_000n));
}

// Convert JS Date to nanoseconds (bigint)
export function dateToNs(date: Date): bigint {
  return BigInt(date.getTime()) * 1_000_000n;
}

// Format a nanosecond timestamp as a time string (HH:MM)
export function nsToTimeString(ns: bigint): string {
  const date = nsToDate(ns);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Format a nanosecond timestamp as a date string
export function nsToDateString(ns: bigint): string {
  return nsToDate(ns).toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format a nanosecond timestamp as date + time
export function nsToDateTimeString(ns: bigint): string {
  const date = nsToDate(ns);
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format frequency for display
export function formatFrequency(freq: Frequency): string {
  if (freq.__kind__ === 'daily') return 'Daily';
  if (freq.__kind__ === 'twiceDaily') return 'Twice Daily';
  if (freq.__kind__ === 'weekly') return 'Weekly';
  if (freq.__kind__ === 'custom') return `Every ${freq.custom} days`;
  return 'Unknown';
}

// Generate a unique ID
export function generateId(): string {
  return `med_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// Get today's start and end in nanoseconds
export function getTodayRange(): { start: bigint; end: bigint } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return {
    start: dateToNs(start),
    end: dateToNs(end),
  };
}

// Check if a nanosecond timestamp falls within today
export function isToday(ns: bigint): boolean {
  const { start, end } = getTodayRange();
  return ns >= start && ns <= end;
}

// Convert a time string "HH:MM" to today's nanosecond timestamp
export function timeStringToTodayNs(timeStr: string): bigint {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
  return dateToNs(date);
}

// Convert nanosecond timestamp to "HH:MM" string
export function nsToHHMM(ns: bigint): string {
  const date = nsToDate(ns);
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (
  date: string | Date,
  options?: Intl.DateTimeFormatOptions,
): string => {
  const formatter = new Intl.DateTimeFormat("en-US", options);

  return formatter.format(date instanceof Date ? date : new Date(date));
};

export function getImageUrl(path: string) {
  if (!path) return "";
  return `${import.meta.env.VITE_S3_URL}/${path}`;
}

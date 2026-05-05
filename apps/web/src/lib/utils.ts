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

export const formatDateForInput = (date: string | Date) => {
  date = date instanceof Date ? date : new Date(date);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
};

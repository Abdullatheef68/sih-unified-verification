import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function generateCertificateNumber() {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 900000) + 100000
  return `LM/${year}/${random}`
}

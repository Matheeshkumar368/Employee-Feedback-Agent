import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getSentimentColor(sentiment: string): string {
  switch (sentiment?.toLowerCase()) {
    case "positive":
      return "text-emerald-400";
    case "negative":
      return "text-red-400";
    case "neutral":
      return "text-yellow-400";
    default:
      return "text-gray-400";
  }
}

export function getSentimentBg(sentiment: string): string {
  switch (sentiment?.toLowerCase()) {
    case "positive":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "negative":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "neutral":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

export function getPriorityBg(priority: string): string {
  switch (priority?.toLowerCase()) {
    case "high":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "medium":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "low":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

export const DEPARTMENTS = [
  "Engineering",
  "Human Resources",
  "Marketing",
  "Sales",
  "Finance",
  "Operations",
  "Design",
  "Product",
  "Legal",
  "Customer Support",
];

export const CATEGORIES = [
  "Work Environment",
  "Management",
  "Compensation & Benefits",
  "Career Growth",
  "Work-Life Balance",
  "Team Collaboration",
  "Communication",
  "Tools & Resources",
  "Company Culture",
  "Other",
];

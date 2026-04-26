import type { BreakdownSeverity, RiskLevel } from "./types";

export function getRiskColor(riskLevel: RiskLevel): string {
  if (riskLevel === "HIGH") {
    return "text-red-600";
  }

  if (riskLevel === "MEDIUM") {
    return "text-amber-600";
  }

  return "text-emerald-600";
}

export function getSeverityColor(severity: BreakdownSeverity): string {
  if (severity === "critical") {
    return "text-red-600";
  }

  if (severity === "warning") {
    return "text-amber-600";
  }

  if (severity === "safe") {
    return "text-emerald-600";
  }

  return "text-cyan-600";
}

export function getRiskBannerClasses(riskLevel: RiskLevel): string {
  if (riskLevel === "HIGH") {
    return "bg-red-500/5 border-l-4 border-l-red-500";
  }

  if (riskLevel === "MEDIUM") {
    return "bg-amber-500/5 border-l-4 border-l-amber-500";
  }

  return "bg-emerald-500/5 border-l-4 border-l-emerald-500";
}

export function truncateUrl(url: string, maxLength: number): string {
  if (url.length <= maxLength) {
    return url;
  }

  return `${url.slice(0, Math.max(0, maxLength - 3))}...`;
}

export function formatAnalyzedAt(isoString: string): string {
  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";

  return `${value("month")} ${value("day")}, ${value("year")} · ${value("hour")}:${value("minute")}`;
}

export function getProgressColor(severity: BreakdownSeverity): string {
  if (severity === "critical") {
    return "bg-red-500";
  }

  if (severity === "warning") {
    return "bg-amber-500";
  }

  if (severity === "safe") {
    return "bg-emerald-500";
  }

  return "bg-cyan-500";
}

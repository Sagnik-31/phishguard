export type RiskLevel = "HIGH" | "MEDIUM" | "SAFE";

export type FindingSeverity = "critical" | "warning" | "info";

export type BreakdownSeverity = "critical" | "warning" | "info" | "safe";

export type LinkRiskLabel = "malicious" | "suspicious" | "safe";

export interface AnalysisResult {
  riskLevel: RiskLevel;
  score: number;
  findings: Finding[];
  extractedLinks: ExtractedLink[];
  breakdown: BreakdownCategory[];
  explanation: string;
  recommendedActions: string[];
  analyzedAt: string;
  fallback?: boolean;
}

export interface Finding {
  id: string;
  severity: FindingSeverity;
  category: string;
  detail: string;
  snippet?: string;
}

export interface ExtractedLink {
  id: string;
  original: string;
  resolved?: string;
  riskLabel: LinkRiskLabel;
  reason: string;
}

export interface BreakdownCategory {
  label: string;
  score: number;
  severity: BreakdownSeverity;
}

export interface DemoEmail {
  id: string;
  label: string;
  content: string;
}

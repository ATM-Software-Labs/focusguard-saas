export interface User {
  id?: string;
  name: string;
  email: string;
  picture?: string;
  created_at?: string;
  tier?: 'free' | 'pro' | 'enterprise';
}

export type Platform = 'windows' | 'unix' | 'ios' | 'android';

export interface Category {
  id: string;
  title: string;
  description: string;
  domains: string[];
  checked: boolean;
  isPremium?: boolean;
}

export interface UserConfig {
  categories: string[];
  custom_domains: string[];
  enabled: boolean;
}

export interface TrujilloAiAnalysis {
  domain: string;
  isThreat: boolean;
  threatCategory: 'ad_tracker' | 'brainrot_game' | 'suspicious_phishing' | 'adult' | 'gambling' | 'clean';
  threatLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  title: string;
  reason: string;
  mechanisms: string[];
  actionRecommendation: 'block' | 'allow' | 'monitor';
  engine: string;
}

export interface ExportData {
  app: string;
  version: string;
  categories: string[];
  custom_domains: string[];
  total_blocked: number;
  exported_at: string;
}

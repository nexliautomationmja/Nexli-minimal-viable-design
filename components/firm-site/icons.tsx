import type { LucideIcon } from 'lucide-react';
import {
  Banknote,
  BookOpen,
  Briefcase,
  Building2,
  Calculator,
  ChartLine,
  ClipboardList,
  FileText,
  Globe,
  Handshake,
  Landmark,
  PiggyBank,
  Receipt,
  Scale,
  ShieldCheck,
  Target,
  TrendingUp,
  User,
  Users,
  Wallet,
} from 'lucide-react';

/**
 * Icon names accepted by FirmSiteConfig.services[].icon.
 * Unknown or missing names fall back to a briefcase.
 */
export const SERVICE_ICONS: Record<string, LucideIcon> = {
  user: User,
  users: Users,
  building: Building2,
  target: Target,
  book: BookOpen,
  banknote: Banknote,
  'trending-up': TrendingUp,
  shield: ShieldCheck,
  calculator: Calculator,
  'file-text': FileText,
  briefcase: Briefcase,
  landmark: Landmark,
  receipt: Receipt,
  wallet: Wallet,
  clipboard: ClipboardList,
  'piggy-bank': PiggyBank,
  scale: Scale,
  handshake: Handshake,
  chart: ChartLine,
  globe: Globe,
};

export function getServiceIcon(name?: string): LucideIcon {
  return (name && SERVICE_ICONS[name]) || Briefcase;
}

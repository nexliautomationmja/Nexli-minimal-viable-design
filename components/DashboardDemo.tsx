import React from 'react';
import {
  LayoutDashboard, Users, FileText, PenLine, Receipt,
  MessageSquare, Settings, TrendingUp, DollarSign,
  BarChart3, UserPlus
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Static mock data
// ---------------------------------------------------------------------------
const navItems = [
  { icon: LayoutDashboard, label: 'Overview', active: true },
  { icon: Users, label: 'Clients' },
  { icon: FileText, label: 'Documents' },
  { icon: PenLine, label: 'Engagements' },
  { icon: Receipt, label: 'Invoices' },
  { icon: MessageSquare, label: 'Messages' },
  { icon: Settings, label: 'Settings' },
];

const statCards = [
  { label: 'Active Clients', value: '127', color: 'text-blue-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20', icon: Users },
  { label: 'Documents', value: '342', badge: '+12 new', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', icon: FileText },
  { label: 'Pipeline Value', value: '$84.5k', color: 'text-cyan-500', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20', icon: TrendingUp },
  { label: 'Conversion Rate', value: '34%', color: 'text-green-500', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20', icon: BarChart3 },
];

const revenueStats = [
  { label: 'Collected', value: '$45,200', color: 'text-emerald-500' },
  { label: 'Outstanding', value: '$12,800', color: 'text-[var(--text-main)]' },
  { label: 'MRR', value: '$8,400', suffix: '/mo', color: 'text-blue-500' },
];

const activityItems = [
  { dot: 'bg-emerald-500', text: 'Sarah Chen paid Invoice #1042', time: '2m ago' },
  { dot: 'bg-blue-500', text: 'Tax return uploaded for Davis LLC', time: '15m ago' },
  { dot: 'bg-violet-500', text: 'Engagement letter signed by Park & Co', time: '1h ago' },
  { dot: 'bg-emerald-500', text: 'Michael Torres completed onboarding', time: '3h ago' },
  { dot: 'bg-gray-400', text: 'Jennifer Wu logged into portal', time: '5h ago' },
];

const leadItems = [
  { name: 'Robert Kim', detail: 'robert@kimfinancial.com', source: 'Website' },
  { name: 'Amanda Foster', detail: '(555) 234-8901', source: 'Referral' },
  { name: 'David Nguyen', detail: 'david@nguyentax.com', source: 'Google' },
  { name: 'Lisa Patel', detail: '(555) 876-5432', source: 'Website' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const DashboardDemo: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Label */}
      <p className="text-center text-[10px] md:text-xs font-black tracking-[0.2em] uppercase text-[var(--text-muted)] mb-4">
        Platform Preview
      </p>

      {/* Dashboard container */}
      <div
        className="rounded-2xl md:rounded-3xl border border-[var(--glass-border)] overflow-hidden select-none pointer-events-none"
        style={{ background: 'var(--bg-main)' }}
      >
        {/* Browser-style top bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--glass-border)]" style={{ background: 'var(--glass-bg)' }}>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 rounded-md text-[10px] text-[var(--text-muted)] border border-[var(--glass-border)]" style={{ background: 'var(--bg-main)' }}>
              app.yourbrand.com/dashboard
            </div>
          </div>
          <div className="w-12" />
        </div>

        {/* Dashboard layout */}
        <div className="flex" style={{ minHeight: 480 }}>
          {/* Sidebar */}
          <div
            className="w-12 md:w-44 shrink-0 border-r border-[var(--glass-border)] flex flex-col py-4"
            style={{ background: 'var(--glass-bg)' }}
          >
            {/* Brand */}
            <div className="px-3 md:px-4 mb-5">
              <p className="hidden md:block text-sm font-black text-[var(--text-main)] tracking-tight">YOUR BRAND</p>
              <div className="md:hidden w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-cyan-500 mx-auto flex items-center justify-center">
                <span className="text-[8px] font-black text-white">YB</span>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-0.5 px-1.5 md:px-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2.5 px-2 md:px-3 py-2 rounded-lg text-xs font-medium transition-none ${
                      item.active
                        ? 'bg-[var(--glass-border)] text-[var(--text-main)] font-semibold'
                        : 'text-[var(--text-muted)]'
                    }`}
                  >
                    <Icon size={14} className="shrink-0 mx-auto md:mx-0" />
                    <span className="hidden md:inline">{item.label}</span>
                  </div>
                );
              })}
            </nav>

            {/* User */}
            <div className="px-2 md:px-3 mt-4 pt-3 border-t border-[var(--glass-border)]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0 mx-auto md:mx-0">
                  <span className="text-[9px] font-bold text-white">JD</span>
                </div>
                <div className="hidden md:block min-w-0">
                  <p className="text-[11px] font-semibold text-[var(--text-main)] truncate">Jane Doe</p>
                  <p className="text-[9px] text-[var(--text-muted)]">Admin</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 p-3 md:p-5 overflow-hidden">
            {/* Header */}
            <div className="mb-4">
              <p className="text-sm md:text-base font-bold text-[var(--text-main)]">Dashboard</p>
              <p className="text-[10px] md:text-xs text-[var(--text-muted)]">Welcome back, Jane</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.label}
                    className="rounded-xl border border-[var(--glass-border)] p-2.5 md:p-3"
                    style={{ background: 'var(--glass-bg)' }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`w-6 h-6 rounded-lg ${card.bgColor} ${card.borderColor} border flex items-center justify-center`}>
                        <Icon size={12} className={card.color} />
                      </div>
                      {card.badge && (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          {card.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-base md:text-lg font-bold text-[var(--text-main)] leading-tight">{card.value}</p>
                    <p className="text-[9px] md:text-[10px] text-[var(--text-muted)] font-medium">{card.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Revenue row */}
            <div className="mb-4">
              <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Revenue</p>
              <div className="grid grid-cols-3 gap-2">
                {revenueStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-[var(--glass-border)] p-2.5"
                    style={{ background: 'var(--glass-bg)' }}
                  >
                    <p className={`text-sm md:text-base font-bold ${stat.color} leading-tight`}>
                      {stat.value}
                      {stat.suffix && <span className="text-[9px] font-medium text-[var(--text-muted)]">{stat.suffix}</span>}
                    </p>
                    <p className="text-[9px] text-[var(--text-muted)] font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity + Leads row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Recent Activity */}
              <div
                className="rounded-xl border border-[var(--glass-border)] p-3"
                style={{ background: 'var(--glass-bg)' }}
              >
                <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2.5">Recent Activity</p>
                <div className="space-y-2">
                  {activityItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${item.dot} mt-1.5 shrink-0`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] md:text-[11px] text-[var(--text-main)] leading-snug truncate">{item.text}</p>
                        <p className="text-[8px] md:text-[9px] text-[var(--text-muted)]">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Leads */}
              <div
                className="rounded-xl border border-[var(--glass-border)] p-3"
                style={{ background: 'var(--glass-bg)' }}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Recent Leads</p>
                  <UserPlus size={12} className="text-[var(--text-muted)]" />
                </div>
                <div className="space-y-2">
                  {leadItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] md:text-[11px] font-semibold text-[var(--text-main)] truncate">{item.name}</p>
                        <p className="text-[8px] md:text-[9px] text-[var(--text-muted)] truncate">{item.detail}</p>
                      </div>
                      <span className="text-[8px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--glass-border)] text-[var(--text-muted)] shrink-0">
                        {item.source}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardDemo;

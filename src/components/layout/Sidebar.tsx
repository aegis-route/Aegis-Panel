'use client';

import React from 'react';
import {
  Activity,
  Shield,
  Network,
  Globe,
  BarChart3,
  Database,
  Cpu,
  Server,
  Terminal,
  CheckCircle2
} from 'lucide-react';
import { ActiveTab } from '../../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  firewallActiveCount?: number;
  blockedDnsRate?: number;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  firewallActiveCount = 15,
  blockedDnsRate = 17.1,
}) => {
  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Tổng quan Hệ thống',
      sublabel: 'NOC Overview & Telemetry',
      icon: Activity,
    },
    {
      id: 'ddos-shield',
      label: 'Phòng thủ DDoS & Lọc gói',
      sublabel: 'Anti-DDoS & Packet Filter',
      icon: Shield,
      badge: `${firewallActiveCount}/16 Active`,
      badgeColor: 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30',
    },
    {
      id: 'network-gateway',
      label: 'Hạ tầng Mạng & Cổng',
      sublabel: 'Chassis, Dual-WAN & NAT',
      icon: Network,
      badge: '24-PORT',
      badgeColor: 'bg-[#00f0ff]/15 text-[#00f0ff] border-[#00f0ff]/30',
    },
    {
      id: 'content-security',
      label: 'Lọc Nội dung & DNS',
      sublabel: 'App Blocker & Anti-Bypass',
      icon: Globe,
      badge: `${blockedDnsRate}% Block`,
      badgeColor: 'bg-[#8b5cf6]/15 text-[#8b5cf6] border-[#8b5cf6]/30',
    },
    {
      id: 'traffic-sla',
      label: 'Phân tích & Đo kiểm SLA',
      sublabel: 'Speedtest & NetFlow v9',
      icon: BarChart3,
    },
    {
      id: 'system-vault',
      label: 'Quản trị & Sao lưu Vault',
      sublabel: 'Snapshots & Audit Journal',
      icon: Database,
    },
  ];

  return (
    <aside className="w-64 bg-[#06090e] border-r border-[#00f0ff]/15 flex flex-col justify-between shrink-0 h-screen select-none z-30">
      {/* Top: Brand Header */}
      <div>
        <div className="p-5 border-b border-[#00f0ff]/15 bg-[#0b111a]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/40 flex items-center justify-center glow-cyan">
              <Shield className="w-6 h-6 text-[#00f0ff]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-widest text-white text-base">AEGIS</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#00f0ff]/20 text-[#00f0ff]">v3.2</span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 tracking-wider">CYBER-NOC CENTER</p>
            </div>
          </div>
        </div>

        {/* Feature-Based Navigation Items */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-left transition-all cursor-pointer font-mono ${
                  isActive
                    ? 'bg-[#00f0ff]/10 border border-[#00f0ff]/50 text-white shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f1724]/70 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#00f0ff]' : 'text-slate-400'
                    }`}
                  />
                  <div>
                    <div className="text-xs font-semibold tracking-wide text-slate-100">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-400">{item.sublabel}</div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${
                      item.badgeColor || 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Service Layer Status & Operator Badge */}
      <div className="p-3 border-t border-[#00f0ff]/15 bg-[#0b111a]/50 text-[11px] font-mono space-y-2.5">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>DATAPATH LAYERS</span>
          <span className="flex items-center gap-1 text-[#10b981]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
            SYNCHRONIZED
          </span>
        </div>

        <div className="space-y-1.5 bg-[#06090e]/80 p-2.5 rounded border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-[#00f0ff]" /> L1 Anti-DDoS Filter
            </span>
            <span className="text-[#10b981] text-[10px] font-bold">ACTIVE</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Server className="w-3 h-3 text-[#10b981]" /> L2 Gateway Routing
            </span>
            <span className="text-[#10b981] text-[10px] font-bold">ACTIVE</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-[#8b5cf6]" /> L3 DNS &amp; Threat API
            </span>
            <span className="text-[#10b981] text-[10px] font-bold">ACTIVE</span>
          </div>
        </div>

        {/* Operator Badge */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
          <div className="flex items-center gap-1">
            <Terminal className="w-3 h-3 text-slate-400" />
            <span>minhmcpc@aegis</span>
          </div>
          <span className="text-[#00f0ff] font-bold">SUPERADMIN</span>
        </div>
      </div>
    </aside>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Activity,
  RefreshCw,
  Radio,
  Clock,
  Lock,
  Wifi,
  Sparkles
} from 'lucide-react';
import { ActiveTab } from '../../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onRefresh: () => void;
  isRefreshing: boolean;
  onToggleLockdown?: () => void;
  isLockdown?: boolean;
}

const TAB_TITLES: Record<ActiveTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Tổng quan Điều hành NOC',
    subtitle: 'Giám sát Lưu lượng, Trạng thái Kết nối & Ma trận Năng lực Phòng thủ',
  },
  'ddos-shield': {
    title: 'Phòng thủ DDoS & Lọc gói',
    subtitle: '16 Module Triệt tiêu Tấn công L3/L4, Auto-Ban IP & Quản lý CIDR',
  },
  'network-gateway': {
    title: 'Hạ tầng Mạng & Cổng kết nối',
    subtitle: '24-Port Chassis, Dual-WAN Failover, Cấp phát DHCP & Điều hướng NAT',
  },
  'content-security': {
    title: 'Lọc Nội dung & Kiểm soát DNS',
    subtitle: 'Chặn Ứng dụng, Game, AI, Chống Vượt rào DoH & Định tuyến Tên miền Nội bộ',
  },
  'traffic-sla': {
    title: 'Phân tích Lưu lượng & Đo kiểm SLA',
    subtitle: 'Speedtest Đa Máy chủ ISP, Luồng NetFlow v9 & Độ trễ Vi mô',
  },
  'system-vault': {
    title: 'Quản trị Hệ thống & Sao lưu Vault',
    subtitle: 'Kho Snapshot Cấu hình Mã hóa, Chính sách Zero-Trust & Nhật ký Kiểm toán',
  },
};

const TICKER_MESSAGES = [
  '● [PHÒNG VỆ] Bộ lọc Ingress SYN-Cookie đã triệt tiêu 14,200 pps bất thường',
  '● [CHỐNG VƯỢT RÀO] Điều hướng NAT đã ép toàn bộ truy vấn Port 53 về Core DNS an toàn',
  '● [ĐƯỜNG TRUYỀN] Kết nối Internet chính (FTTH GPON): Hoạt động tốt 100% (RTT: 2.1ms)',
  '● [TRÍ TUỆ ĐE DỌA] Cơ sở dữ liệu IP Intelligence đã đồng bộ phiên bản mới nhất',
  '● [KIỂM SOÁT] Đang thực thi chính sách hạn chế ứng dụng và dịch vụ mạng'
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onRefresh,
  isRefreshing,
  onToggleLockdown,
  isLockdown = false,
}) => {
  const [tickerIndex, setTickerIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('vi-VN', { hour12: false }) + ' ICT');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const tickerInterval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % TICKER_MESSAGES.length);
    }, 4500);
    return () => clearInterval(tickerInterval);
  }, []);

  const { title, subtitle } = TAB_TITLES[activeTab] || TAB_TITLES.overview;

  return (
    <header className="h-20 bg-[#0b111a]/90 backdrop-blur-md border-b border-[#00f0ff]/15 px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
      {/* Left: Tab Title & Subtitle */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-wider text-white flex items-center gap-2">
            <span className="text-[#00f0ff]">AEGIS //</span> {title}
          </h1>
          <span className="px-2.5 py-0.5 text-[11px] font-mono uppercase rounded bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-3 h-3 text-[#00f0ff]" /> DEMO MODE
          </span>
          <span className="px-2.5 py-0.5 text-[11px] font-mono uppercase rounded bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> SECURE
          </span>
        </div>
        <p className="text-xs text-slate-400 font-mono mt-0.5">{subtitle}</p>
      </div>

      {/* Middle: Cyber Alert Ticker */}
      <div className="hidden xl:flex items-center gap-2 max-w-md bg-[#06090e]/80 border border-[#00f0ff]/20 px-3 py-1.5 rounded-full text-xs font-mono text-slate-300">
        <Radio className="w-3.5 h-3.5 text-[#00f0ff] animate-ping" />
        <span className="truncate text-slate-300 transition-all duration-300">
          {TICKER_MESSAGES[tickerIndex]}
        </span>
      </div>

      {/* Right: Actions & Clock */}
      <div className="flex items-center gap-3">
        {/* Clock */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-[#0f1724] px-3 py-1.5 rounded border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-[#00f0ff]" />
          <span>{currentTime || '12:00:00 ICT'}</span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f1724] hover:bg-[#141f32] text-slate-200 text-xs font-mono rounded border border-[#00f0ff]/30 hover:border-[#00f0ff] transition-all cursor-pointer"
          title="Làm mới chỉ số viễn trắc"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#00f0ff] ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">REFRESH</span>
        </button>

        {/* Lockdown Mode Toggle */}
        <button
          onClick={onToggleLockdown}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded border transition-all cursor-pointer ${
            isLockdown
              ? 'bg-red-600/20 text-red-400 border-red-500 glow-crimson'
              : 'bg-[#0f1724] text-slate-400 border-slate-700 hover:border-red-500/50 hover:text-red-400'
          }`}
          title="Chế độ Khẩn cấp (Chỉ cho phép lưu lượng trong Whitelist)"
        >
          <Lock className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isLockdown ? 'LOCKDOWN: ON' : 'LOCKDOWN'}</span>
        </button>
      </div>
    </header>
  );
};

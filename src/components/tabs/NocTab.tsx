'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  ShieldCheck,
  Network,
  ArrowDownUp,
  Cpu,
  Server,
  Globe,
  AlertTriangle,
  Zap,
  Lock,
  Wifi,
  ExternalLink,
  BarChart3
} from 'lucide-react';
import { ActiveTab } from '../../types';
import { GeoMap } from '../common/GeoMap';

interface NocTabProps {
  onNavigateTab: (tab: ActiveTab) => void;
}

export const NocTab: React.FC<NocTabProps> = ({ onNavigateTab }) => {
  const [throughput, setThroughput] = useState(842.4);
  const [pps, setPps] = useState(184200);
  const [drops, setDrops] = useState(4120890);
  const [chartData, setChartData] = useState<number[]>([
    45, 52, 58, 64, 60, 68, 74, 70, 78, 85, 82, 89, 93, 88, 94
  ]);

  // Subtle real-time fluctuation simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setThroughput((prev) => +(prev + (Math.random() * 4 - 2)).toFixed(1));
      setPps((prev) => Math.floor(prev + (Math.random() * 800 - 400)));
      setDrops((prev) => prev + Math.floor(Math.random() * 3));
      setChartData((prev) => {
        const next = [...prev.slice(1), Math.floor(75 + Math.random() * 20)];
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ingress Throughput */}
        <div className="glass-panel p-4 rounded-xl border border-[#00f0ff]/20 bg-[#0b111a]/80 relative overflow-hidden group hover:border-[#00f0ff]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">BĂNG THÔNG INGRESS</span>
            <ArrowDownUp className="w-4 h-4 text-[#00f0ff]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white tracking-tight">
              {throughput}
            </span>
            <span className="text-xs font-mono text-[#00f0ff]">Mbps</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Đỉnh: 1,024 Mbps</span>
            <span className="text-[#10b981] flex items-center gap-1">
              <Zap className="w-3 h-3" /> Đường truyền tối ưu
            </span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-[#00f0ff]/5 rounded-full blur-xl pointer-events-none group-hover:bg-[#00f0ff]/10 transition-all" />
        </div>

        {/* Card 2: Packets Per Second */}
        <div className="glass-panel p-4 rounded-xl border border-[#10b981]/20 bg-[#0b111a]/80 relative overflow-hidden group hover:border-[#10b981]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">TỐC ĐỘ XỬ LÝ GÓI</span>
            <Cpu className="w-4 h-4 text-[#10b981]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white tracking-tight">
              {pps.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-[#10b981]">pps</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Tăng tốc phần cứng: 99.4%</span>
            <span className="text-[#10b981]">Độ trễ 0.04ms</span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-[#10b981]/5 rounded-full blur-xl pointer-events-none group-hover:bg-[#10b981]/10 transition-all" />
        </div>

        {/* Card 3: Active Connections */}
        <div className="glass-panel p-4 rounded-xl border border-[#8b5cf6]/20 bg-[#0b111a]/80 relative overflow-hidden group hover:border-[#8b5cf6]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">PHIÊN KẾT NỐI HOẠT ĐỘNG</span>
            <Network className="w-4 h-4 text-[#8b5cf6]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white tracking-tight">
              1,842
            </span>
            <span className="text-xs font-mono text-[#8b5cf6]">sessions</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>L3 FastTrack: 1,620 active</span>
            <span className="text-slate-300">Tối đa: 65,536</span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-[#8b5cf6]/5 rounded-full blur-xl pointer-events-none group-hover:bg-[#8b5cf6]/10 transition-all" />
        </div>

        {/* Card 4: Mitigation Drops */}
        <div className="glass-panel p-4 rounded-xl border border-red-500/20 bg-[#0b111a]/80 relative overflow-hidden group hover:border-red-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">ĐE DỌA ĐÃ TRIỆT TIÊU</span>
            <ShieldCheck className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white tracking-tight">
              {drops.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-red-400">gói tin</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Auto-Ban: 5 IP đang chặn</span>
            <span className="text-red-400">0% False Positives</span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-red-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-red-500/10 transition-all" />
        </div>
      </div>

      {/* 2. Four-Tier Feature Capabilities Matrix */}
      <div className="glass-panel rounded-xl border border-[#00f0ff]/20 bg-[#0b111a]/80 p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Network className="w-5 h-5 text-[#00f0ff]" />
            <div>
              <h2 className="text-sm font-bold font-mono text-white tracking-wide">
                MA TRẬN NĂNG LỰC BẢO MẬT &amp; HẠ TẦNG ĐIỀU HÀNH
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Kiến trúc phòng vệ đa lớp tích hợp theo tính năng nghiệp vụ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-[#10b981]">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
              TOÀN BỘ PHÂN HỆ HOẠT ĐỘNG
            </span>
          </div>
        </div>

        {/* Feature Matrix Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Layer 1: Anti-DDoS Shield */}
          <div className="bg-[#06090e] border border-[#00f0ff]/40 rounded-lg p-4 flex flex-col justify-between relative group hover:border-[#00f0ff] transition-all shadow-[0_0_15px_rgba(0,240,255,0.06)]">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40">
                  LỚP 1 // AN NINH L3/L4
                </span>
                <Cpu className="w-4 h-4 text-[#00f0ff]" />
              </div>
              <div className="my-3">
                <div className="text-sm font-bold text-white font-mono">Phòng thủ DDoS &amp; Lọc gói</div>
                <div className="text-xs text-slate-400 font-mono mt-1">
                  16 module triệt tiêu tấn công SYN/UDP Flood, GeoIP &amp; Auto-Ban tức thì
                </div>
                <div className="mt-2 text-[11px] font-mono text-[#00f0ff]">Trạng thái: 15/16 Module Active</div>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('ddos-shield')}
              className="pt-2.5 border-t border-slate-800 text-[10px] font-mono text-[#00f0ff] hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span>Xem Phòng thủ DDoS</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Layer 2: Network & Gateway */}
          <div className="bg-[#06090e] border border-[#10b981]/40 rounded-lg p-4 flex flex-col justify-between relative group hover:border-[#10b981] transition-all">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40">
                  LỚP 2 // ĐỊNH TUYẾN &amp; CỔNG
                </span>
                <Server className="w-4 h-4 text-[#10b981]" />
              </div>
              <div className="my-3">
                <div className="text-sm font-bold text-white font-mono">Hạ tầng Mạng &amp; Cổng kết nối</div>
                <div className="text-xs text-slate-400 font-mono mt-1">
                  Chassis 24 cổng, chuyển mạch Dual-WAN, DHCP Leases, FastTrack &amp; NAT
                </div>
                <div className="mt-2 text-[11px] font-mono text-[#10b981]">Trạng thái: 24 Cổng Link UP</div>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('network-gateway')}
              className="pt-2.5 border-t border-slate-800 text-[10px] font-mono text-[#10b981] hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span>Quản lý Mạng &amp; Cổng</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Layer 3: Content & DNS Security */}
          <div className="bg-[#06090e] border border-[#8b5cf6]/40 rounded-lg p-4 flex flex-col justify-between relative group hover:border-[#8b5cf6] transition-all">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/40">
                  LỚP 3 // NỘI DUNG &amp; DNS
                </span>
                <Globe className="w-4 h-4 text-[#8b5cf6]" />
              </div>
              <div className="my-3">
                <div className="text-sm font-bold text-white font-mono">Lọc Nội dung &amp; DNS An toàn</div>
                <div className="text-xs text-slate-400 font-mono mt-1">
                  Chặn 11 danh mục Game, AI, MXH, ép luồng chống vượt rào DoH &amp; DNS nội bộ
                </div>
                <div className="mt-2 text-[11px] font-mono text-[#8b5cf6]">Trạng thái: 17.1% Tỷ lệ chặn</div>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('content-security')}
              className="pt-2.5 border-t border-slate-800 text-[10px] font-mono text-[#8b5cf6] hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span>Xem Chính sách Lọc DNS</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Layer 4: Traffic Analytics & SLA */}
          <div className="bg-[#06090e] border border-amber-500/40 rounded-lg p-4 flex flex-col justify-between relative group hover:border-amber-500 transition-all">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  LỚP 4 // PHÂN TÍCH &amp; SLA
                </span>
                <BarChart3 className="w-4 h-4 text-amber-400" />
              </div>
              <div className="my-3">
                <div className="text-sm font-bold text-white font-mono">Phân tích Lưu lượng &amp; Đo kiểm</div>
                <div className="text-xs text-slate-400 font-mono mt-1">
                  Công cụ đo tốc độ Speedtest FTTH, phân tích luồng NetFlow v9 &amp; kiểm tra độ trễ
                </div>
                <div className="mt-2 text-[11px] font-mono text-amber-400">Trạng thái: 0.0% Packet Loss</div>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('traffic-sla')}
              className="pt-2.5 border-t border-slate-800 text-[10px] font-mono text-amber-400 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span>Xem Phân tích &amp; SLA</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Traffic Flow Graph & Threat Vectors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Simulated Real-time Traffic Graph (2 Cols) */}
        <div className="lg:col-span-2 glass-panel rounded-xl border border-[#00f0ff]/20 bg-[#0b111a]/80 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00f0ff]" />
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Lưu lượng Cổng Mạng Thời Gian Thực (Ingress RX vs Egress TX)
              </h3>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-[#00f0ff]">
                <span className="w-2.5 h-1 bg-[#00f0ff] inline-block rounded" /> Ingress RX
              </span>
              <span className="flex items-center gap-1.5 text-[#10b981]">
                <span className="w-2.5 h-1 bg-[#10b981] inline-block rounded" /> Egress TX
              </span>
            </div>
          </div>

          {/* SVG Sparkline Graph */}
          <div className="mt-4 h-48 w-full relative flex items-end">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="cyber-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#1e293b" strokeDasharray="4 4" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#1e293b" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#1e293b" strokeDasharray="4 4" />

              {/* Area */}
              <polygon
                points={`0,150 ${chartData
                  .map((val, i) => `${(i / (chartData.length - 1)) * 500},${150 - val * 1.3}`)
                  .join(' ')} 500,150`}
                fill="url(#cyber-gradient)"
              />

              {/* Path */}
              <polyline
                fill="none"
                stroke="#00f0ff"
                strokeWidth="2.5"
                points={chartData
                  .map((val, i) => `${(i / (chartData.length - 1)) * 500},${150 - val * 1.3}`)
                  .join(' ')}
              />

              {/* Current Point */}
              <circle
                cx="500"
                cy={150 - chartData[chartData.length - 1] * 1.3}
                r="4"
                fill="#00f0ff"
              />
            </svg>
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
            <span>Khoảng đo: 30 giây gần nhất</span>
            <span>Tần số lấy mẫu: 50ms</span>
            <span className="text-[#00f0ff]">Trạng thái: Hoạt động thông suốt</span>
          </div>
        </div>

        {/* Right: Threat Vector Breakdown (1 Col) */}
        <div className="glass-panel rounded-xl border border-[#00f0ff]/20 bg-[#0b111a]/80 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Phân Bổ Các Loại Tấn Công
              </h3>
            </div>

            <div className="mt-4 space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>TCP SYN Flood</span>
                  <span className="text-[#00f0ff]">38.2%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                  <div className="bg-[#00f0ff] h-full" style={{ width: '38.2%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>UDP / DNS Amplification</span>
                  <span className="text-[#10b981]">29.4%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                  <div className="bg-[#10b981] h-full" style={{ width: '29.4%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>GeoIP Sanctioned ASNs</span>
                  <span className="text-amber-400">18.5%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                  <div className="bg-amber-400 h-full" style={{ width: '18.5%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Slowloris &amp; Application L7</span>
                  <span className="text-red-400">13.9%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                  <div className="bg-red-400 h-full" style={{ width: '13.9%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-[#06090e] rounded border border-slate-800 text-[11px] font-mono text-slate-400">
            <div className="flex items-center justify-between text-slate-300">
              <span>Mức độ an ninh:</span>
              <span className="text-[#10b981] font-bold">AN TOÀN (TẤT CẢ LỚP BẢO VỆ ĐANG CHẠY)</span>
            </div>
            <div className="mt-1 text-slate-400">
              Cơ chế tự động triệt tiêu lưu lượng độc hại ngay tại tầng lõi không làm nghẽn CPU.
            </div>
          </div>
        </div>
      </div>

      {/* 4. Real-Time Cyber Connection GeoMap */}
      <GeoMap />
    </div>
  );
};

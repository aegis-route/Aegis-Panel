'use client';

import React from 'react';
import { Globe, ShieldAlert, Zap, Radio } from 'lucide-react';

interface GeoMapProps {
  onNodeClick?: (nodeName: string, detail: string) => void;
}

export const GeoMap: React.FC<GeoMapProps> = ({ onNodeClick }) => {
  const handleToast = (title: string, desc: string) => {
    if (onNodeClick) {
      onNodeClick(title, desc);
    }
  };

  return (
    <div className="glass-panel rounded-xl border border-[#00f0ff]/20 bg-[#0b111a]/80 p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <Globe className="w-5 h-5 text-[#00f0ff]" />
          <div>
            <h3 className="text-sm font-bold font-mono text-white tracking-wide">
              BẢN ĐỒ PHÂN BỐ KẾT NỐI &amp; MỐI ĐE DỌA TOÀN CẦU (CYBER GEOMAP)
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Theo dõi luồng truy cập hợp lệ và các vector tấn công hướng về Aegis Gateway (Việt Nam)
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-[#00f0ff]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" />
            Inbound Sạch
          </span>
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
            XDP Threat Drop
          </span>
          <span className="flex items-center gap-1.5 text-[#10b981]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
            Aegis Gateway (VN)
          </span>
          <span className="px-2 py-0.5 rounded bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 text-[10px] font-bold">
            LIVE MAP
          </span>
        </div>
      </div>

      {/* Map + Side Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 items-stretch">
        {/* SVG World Map (8 Cols) */}
        <div className="lg:col-span-8 bg-gradient-to-br from-[#0a192f]/90 to-[#060b13]/95 border border-[#00f0ff]/15 rounded-xl p-2 relative overflow-hidden flex items-center justify-center min-h-[380px]">
          <svg viewBox="0 0 1000 500" className="w-full h-full min-h-[360px] select-none">
            <defs>
              <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
              </linearGradient>
              <filter id="geoGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background Grid */}
            <g stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.5" strokeDasharray="3 3">
              <line x1="0" y1="125" x2="1000" y2="125" />
              <line x1="0" y1="250" x2="1000" y2="250" />
              <line x1="0" y1="375" x2="1000" y2="375" />
              <line x1="250" y1="0" x2="250" y2="500" />
              <line x1="500" y1="0" x2="500" y2="500" />
              <line x1="750" y1="0" x2="750" y2="500" />
            </g>

            {/* Continents Vector Shapes */}
            <g className="fill-[#0d1a2d]/80 stroke-[#00f0ff]/25 hover:fill-[#00f0ff]/10 transition-colors">
              {/* North America */}
              <path d="M 120,60 L 280,50 L 340,90 L 360,130 L 300,160 L 260,210 L 220,240 L 190,260 L 170,220 L 130,170 L 80,120 Z" />
              {/* South America */}
              <path d="M 230,270 L 310,260 L 360,330 L 330,420 L 280,470 L 250,420 L 220,340 Z" />
              {/* Europe */}
              <path d="M 450,70 L 570,65 L 590,120 L 540,160 L 480,160 L 440,120 Z" />
              {/* Africa */}
              <path d="M 460,180 L 570,175 L 610,240 L 570,370 L 520,410 L 460,310 L 430,220 Z" />
              {/* Asia */}
              <path d="M 580,65 L 890,70 L 910,140 L 860,200 L 780,270 L 720,280 L 660,240 L 610,180 Z" />
              {/* Australia */}
              <path d="M 810,330 L 920,320 L 940,390 L 870,420 L 810,380 Z" />
            </g>

            {/* Animated Flight Arcs (Streaming into Gateway Vietnam 755, 255) */}
            {/* US West (San Jose) -> VN */}
            <path d="M 160,175 Q 450,60 755,255" fill="none" stroke="#00f0ff" strokeWidth="1.2" strokeDasharray="6 4" className="opacity-70" />
            {/* US East (Ashburn) -> VN */}
            <path d="M 260,165 Q 500,80 755,255" fill="none" stroke="#00f0ff" strokeWidth="1.2" strokeDasharray="6 4" className="opacity-70" />
            {/* Germany (Frankfurt) -> VN */}
            <path d="M 515,140 Q 640,160 755,255" fill="none" stroke="#00f0ff" strokeWidth="1.2" strokeDasharray="6 4" className="opacity-70" />
            {/* UK (London) -> VN */}
            <path d="M 475,130 Q 620,150 755,255" fill="none" stroke="#00f0ff" strokeWidth="1.2" strokeDasharray="6 4" className="opacity-70" />
            {/* Singapore -> VN */}
            <path d="M 745,290 Q 750,270 755,255" fill="none" stroke="#10b981" strokeWidth="1.8" className="opacity-90" />
            {/* Japan (Tokyo) -> VN */}
            <path d="M 865,180 Q 810,210 755,255" fill="none" stroke="#10b981" strokeWidth="1.8" className="opacity-90" />
            {/* China (Threat DDoS Vector) -> VN */}
            <path d="M 795,205 Q 775,230 755,255" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" className="opacity-90 animate-pulse" />
            {/* Russia (Threat Vector) -> VN */}
            <path d="M 580,120 Q 670,170 755,255" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeDasharray="4 4" className="opacity-90 animate-pulse" />
            {/* Australia (Sydney) -> VN */}
            <path d="M 885,385 Q 830,320 755,255" fill="none" stroke="#00f0ff" strokeWidth="1.2" strokeDasharray="6 4" className="opacity-70" />

            {/* Target Gateway Node (Hanoi / HCMC - Vietnam) */}
            <circle cx="755" cy="255" r="28" fill="none" stroke="#00f0ff" strokeWidth="1" className="opacity-40 animate-ping" />
            <circle cx="755" cy="255" r="16" fill="none" stroke="#00f0ff" strokeWidth="1" className="opacity-60" />
            <circle cx="755" cy="255" r="7" fill="#00f0ff" filter="url(#geoGlow)" />
            <circle cx="755" cy="255" r="3" fill="#ffffff" />
            <text x="765" y="275" fill="#00f0ff" fontSize="11" fontWeight="700" fontFamily="monospace">
              🇻🇳 Aegis Gateway (VN)
            </text>

            {/* Source Nodes */}
            {/* US West */}
            <circle cx="160" cy="175" r="4" fill="#38bdf8" className="cursor-pointer hover:r-6" onClick={() => handleToast('US West (San Jose)', '4,820 PPS | Normal')} />
            <text x="110" y="195" fill="#94a3b8" fontSize="10" fontFamily="monospace">🇺🇸 San Jose</text>

            {/* US East */}
            <circle cx="260" cy="165" r="4" fill="#38bdf8" className="cursor-pointer hover:r-6" onClick={() => handleToast('US East (Ashburn)', '3,030 PPS | Normal')} />
            <text x="210" y="150" fill="#94a3b8" fontSize="10" fontFamily="monospace">🇺🇸 Ashburn</text>

            {/* Frankfurt */}
            <circle cx="515" cy="140" r="4" fill="#38bdf8" className="cursor-pointer hover:r-6" onClick={() => handleToast('Germany (Frankfurt)', '2,280 PPS | Normal')} />
            <text x="475" y="125" fill="#94a3b8" fontSize="10" fontFamily="monospace">🇩🇪 Frankfurt</text>

            {/* London */}
            <circle cx="475" cy="130" r="4" fill="#38bdf8" className="cursor-pointer hover:r-6" onClick={() => handleToast('UK (London)', '1,420 PPS | Normal')} />
            <text x="430" y="115" fill="#94a3b8" fontSize="10" fontFamily="monospace">🇬🇧 London</text>

            {/* Singapore */}
            <circle cx="745" cy="290" r="5" fill="#10b981" className="cursor-pointer hover:r-6" onClick={() => handleToast('Singapore Hub', '7,890 PPS | Fast-Path 12ms')} />
            <text x="690" y="310" fill="#10b981" fontSize="10" fontFamily="monospace">🇸🇬 Singapore</text>

            {/* Tokyo */}
            <circle cx="865" cy="180" r="4.5" fill="#10b981" className="cursor-pointer hover:r-6" onClick={() => handleToast('Japan (Tokyo)', '3,110 PPS | Normal 28ms')} />
            <text x="875" y="175" fill="#94a3b8" fontSize="10" fontFamily="monospace">🇯🇵 Tokyo</text>

            {/* China (Threat Node) */}
            <circle cx="795" cy="205" r="18" fill="none" stroke="#ef4444" strokeWidth="1" className="opacity-60 animate-ping" />
            <circle cx="795" cy="205" r="5" fill="#ef4444" filter="url(#geoGlow)" className="cursor-pointer" onClick={() => handleToast('China Vector', 'SYN Flood DROPPED by eBPF!')} />
            <text x="805" y="215" fill="#ef4444" fontSize="10" fontWeight="700" fontFamily="monospace">🇨🇳 Attack Origin</text>

            {/* Russia (Threat Node) */}
            <circle cx="580" cy="120" r="4.5" fill="#ef4444" className="cursor-pointer" onClick={() => handleToast('Russia Vector', 'UDP Amp DROPPED by Method 09!')} />
            <text x="590" y="115" fill="#ef4444" fontSize="10" fontFamily="monospace">🇷🇺 Scan Probe</text>

            {/* Sydney */}
            <circle cx="885" cy="385" r="4" fill="#38bdf8" className="cursor-pointer hover:r-6" onClick={() => handleToast('Australia (Sydney)', '980 PPS | Normal')} />
            <text x="895" y="380" fill="#94a3b8" fontSize="10" fontFamily="monospace">🇦🇺 Sydney</text>
          </svg>
        </div>

        {/* Side Statistics & Breakdown (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4 font-mono text-xs">
          <div className="bg-[#06090e] border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-3">
              <span className="font-bold text-white uppercase text-[11px]">
                Phân Bố Quốc Gia (Top Geo)
              </span>
              <span className="text-[#00f0ff] text-[10px] flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" /> Live 1s
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-slate-300 mb-1 text-[11px]">
                  <span>🇻🇳 Việt Nam (Nội địa)</span>
                  <span className="text-[#00f0ff] font-bold">58.4%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                  <div className="bg-[#00f0ff] h-full" style={{ width: '58.4%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1 text-[11px]">
                  <span>🇸🇬 Singapore (Transit Hub)</span>
                  <span className="text-[#10b981] font-bold">14.2%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                  <div className="bg-[#10b981] h-full" style={{ width: '14.2%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1 text-[11px]">
                  <span>🇺🇸 Hoa Kỳ (Cloud &amp; CDNs)</span>
                  <span className="text-blue-400 font-bold">11.8%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                  <div className="bg-blue-400 h-full" style={{ width: '11.8%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1 text-[11px]">
                  <span>🇯🇵 Nhật Bản (AP-East)</span>
                  <span className="text-purple-400 font-bold">5.6%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                  <div className="bg-purple-400 h-full" style={{ width: '5.6%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1 text-[11px]">
                  <span>🇩🇪 Đức (Frankfurt Hub)</span>
                  <span className="text-cyan-400 font-bold">4.1%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                  <div className="bg-cyan-400 h-full" style={{ width: '4.1%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-red-400 mb-1 text-[11px]">
                  <span>🇨🇳 Trung Quốc (Đã chặn)</span>
                  <span className="text-red-400 font-bold">5.9% (Drop)</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                  <div className="bg-red-500 h-full" style={{ width: '5.9%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#06090e] rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center justify-between text-slate-200">
              <span className="font-bold flex items-center gap-1.5 text-white">
                <Zap className="w-3.5 h-3.5 text-[#00f0ff]" /> Cổng Gateway Việt Nam
              </span>
              <span className="text-[#10b981] font-bold">100% ONLINE</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Mọi luồng dữ liệu độc hại xuyên biên giới được lọc tức thì trước khi vào mạng nội bộ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

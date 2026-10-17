'use client';

import React, { useState, useMemo } from 'react';
import {
  Server,
  Radio,
  Zap,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Terminal,
  Copy,
  Check,
  Search,
  Filter,
  XCircle,
  Activity,
  Globe,
  SlidersHorizontal,
  ArrowRight,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import {
  NetworkPort,
  DhcpLease,
  NatRule,
  PppoeProfile,
  FirewallConnection
} from '../../types';

interface RoutingTabProps {
  ports: NetworkPort[];
  leases: DhcpLease[];
  natRules: NatRule[];
  pppoeProfiles: PppoeProfile[];
  connections: FirewallConnection[];
  onToggleFastTrack: (leaseId: string) => void;
  onSwitchIsp: (ispId: string) => void;
  onAddPppoe: (profileData: Omit<PppoeProfile, 'id'>) => void;
  onEditPppoe: (profile: PppoeProfile) => void;
  onDeletePppoe: (id: string) => void;
  onAddNatRule: (ruleData: Omit<NatRule, 'id' | 'packets'>) => void;
  onEditNatRule: (rule: NatRule) => void;
  onDeleteNatRule: (id: number) => void;
  onToggleNatRule: (id: number) => void;
  onKillConnection: (connId: string) => void;
}

// Preset nhà mạng Việt Nam chuẩn hóa
const VN_ISP_TEMPLATES = [
  {
    provider: 'FPT',
    name: 'FPT Telecom FTTH GPON',
    badge: 'FPT Telecom',
    vlanId: 7,
    iface: 'ether1',
    username: 'hni_fpt@fpt',
    password: 'fpt@gpon2026',
    mtu: 1492,
    distance: 1,
    recommendation: 'VLAN 7 chuẩn hóa GPON Bridge. MTU 1492. Hỗ trợ IPv6 Prefix Delegation /56.'
  },
  {
    provider: 'Viettel',
    name: 'Viettel Telecom GPON',
    badge: 'Viettel Telecom',
    vlanId: 35,
    iface: 'ether1',
    username: 't008_gpon_viettel',
    password: 'viettel@ftth99',
    mtu: 1492,
    distance: 2,
    recommendation: 'VLAN 35 trên modem DASAN/ZTE/Huawei Bridge. Keepalive 10s tự động failover.'
  },
  {
    provider: 'VNPT',
    name: 'VNPT Vinaphone FiberVNN',
    badge: 'VNPT Vinaphone',
    vlanId: 32,
    iface: 'ether1',
    username: 'hni_vnpt_fibervnn@megamail.vn',
    password: 'vnpt@fiber2026',
    mtu: 1492,
    distance: 1,
    recommendation: 'VLAN 32 (hoặc VLAN 11 miền Nam) trên Alcatel/ZTE GPON ONT. Ưu tiên peering quốc tế.'
  }
];

// Quick templates mở port phổ biến
const NAT_QUICK_PRESETS = [
  {
    label: 'Web Server (80/443)',
    proto: 'tcp' as const,
    dstPort: '80,443',
    toAddress: '10.10.100.10',
    toPort: '443',
    comment: 'Ingress Web Reverse Proxy SSL/TLS'
  },
  {
    label: 'WireGuard VPN',
    proto: 'udp' as const,
    dstPort: '51820',
    toAddress: '10.10.100.5',
    toPort: '51820',
    comment: 'Secure WireGuard Ingress Endpoint'
  },
  {
    label: 'Winbox Remote',
    proto: 'tcp' as const,
    dstPort: '8291',
    toAddress: '10.10.1.1',
    toPort: '8291',
    comment: 'RouterOS Remote Winbox Admin'
  },
  {
    label: 'Minecraft Game',
    proto: 'tcp' as const,
    dstPort: '25565',
    toAddress: '10.10.1.150',
    toPort: '25565',
    comment: 'Internal Minecraft Server Host'
  },
  {
    label: 'Plex Media',
    proto: 'tcp' as const,
    dstPort: '32400',
    toAddress: '10.10.1.200',
    toPort: '32400',
    comment: 'Plex Media Server Direct Play'
  }
];

export const RoutingTab: React.FC<RoutingTabProps> = ({
  ports,
  leases,
  natRules,
  pppoeProfiles,
  connections,
  onToggleFastTrack,
  onSwitchIsp,
  onAddPppoe,
  onEditPppoe,
  onDeletePppoe,
  onAddNatRule,
  onEditNatRule,
  onDeleteNatRule,
  onToggleNatRule,
  onKillConnection
}) => {
  const [selectedPort, setSelectedPort] = useState<NetworkPort>(ports[0] || {
    id: 'ether1',
    name: 'ether1',
    label: 'WAN-FPT',
    speed: '1Gbps',
    status: 'UP',
    vlan: 7,
    rx: '48.2 MB/s',
    tx: '12.4 MB/s',
    ip: '118.69.144.82'
  });

  const [activeIspId, setActiveIspId] = useState<string>('fpt');

  // --- PPPoE Modal States ---
  const [showPppoeModal, setShowPppoeModal] = useState<boolean>(false);
  const [editingPppoe, setEditingPppoe] = useState<PppoeProfile | null>(null);
  const [showPppoePassword, setShowPppoePassword] = useState<boolean>(false);
  const [copiedCli, setCopiedCli] = useState<boolean>(false);

  const [pppoeForm, setPppoeForm] = useState<Omit<PppoeProfile, 'id'>>({
    name: 'FPT Telecom FTTH GPON',
    badge: 'FPT Telecom',
    vlanId: 7,
    iface: 'ether1',
    username: 'hni_fpt@fpt',
    password: 'fpt@gpon2026',
    mtu: 1492,
    distance: 1,
    recommendation: 'VLAN 7 chuẩn hóa GPON Bridge. MTU 1492. Hỗ trợ IPv6 Prefix Delegation /56.',
    status: 'CONNECTED',
    usePeerDns: false,
    addDefaultRoute: true,
    ipAddress: '118.69.144.82',
    gateway: '118.69.144.1'
  });

  // --- NAT Modal States ---
  const [showNatModal, setShowNatModal] = useState<boolean>(false);
  const [editingNat, setEditingNat] = useState<NatRule | null>(null);
  const [natForm, setNatForm] = useState<Omit<NatRule, 'id' | 'packets'>>({
    chain: 'dstnat',
    proto: 'tcp',
    inInterface: 'ether1-WAN',
    dstPort: '443',
    toAddress: '10.10.100.10',
    toPort: '443',
    comment: 'Ingress Web Reverse Proxy',
    enabled: true
  });

  // --- Conntrack Table Filters ---
  const [searchConn, setSearchConn] = useState<string>('');
  const [protoFilter, setProtoFilter] = useState<'all' | 'tcp' | 'udp' | 'icmp'>('all');
  const [markFilter, setMarkFilter] = useState<string>('all');
  const [tcpStateFilter, setTcpStateFilter] = useState<string>('all');

  // RouterOS CLI generator for PPPoE
  const generatedPppoeCli = useMemo(() => {
    return `/interface pppoe-client add name="${pppoeForm.name.replace(/\s+/g, '_')}" interface=${pppoeForm.iface} user="${pppoeForm.username}" password="${pppoeForm.password || ''}" max-mtu=${pppoeForm.mtu} max-mru=${pppoeForm.mtu} default-route-distance=${pppoeForm.distance} add-default-route=${pppoeForm.addDefaultRoute !== false ? 'yes' : 'no'} use-peer-dns=${pppoeForm.usePeerDns ? 'yes' : 'no'} disabled=no`;
  }, [pppoeForm]);

  const handleCopyCli = () => {
    navigator.clipboard?.writeText(generatedPppoeCli);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const handleOpenAddPppoe = () => {
    setEditingPppoe(null);
    setPppoeForm({
      name: 'Viettel Telecom GPON',
      badge: 'Viettel Telecom',
      vlanId: 35,
      iface: 'ether1',
      username: 't008_gpon_viettel',
      password: 'viettel@ftth99',
      mtu: 1492,
      distance: 2,
      recommendation: 'VLAN 35 trên modem DASAN/ZTE/Huawei Bridge.',
      status: 'CONNECTED',
      usePeerDns: false,
      addDefaultRoute: true,
      ipAddress: '171.244.38.105',
      gateway: '171.244.38.1'
    });
    setShowPppoeModal(true);
  };

  const handleOpenEditPppoe = (p: PppoeProfile) => {
    setEditingPppoe(p);
    setPppoeForm({
      name: p.name,
      badge: p.badge,
      vlanId: p.vlanId,
      iface: p.iface,
      username: p.username,
      password: p.password || '',
      mtu: p.mtu,
      distance: p.distance,
      recommendation: p.recommendation,
      status: p.status || 'CONNECTED',
      usePeerDns: p.usePeerDns || false,
      addDefaultRoute: p.addDefaultRoute !== false,
      ipAddress: p.ipAddress || '',
      gateway: p.gateway || ''
    });
    setShowPppoeModal(true);
  };

  const handleSavePppoe = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPppoe) {
      onEditPppoe({
        ...pppoeForm,
        id: editingPppoe.id
      });
    } else {
      onAddPppoe(pppoeForm);
    }
    setShowPppoeModal(false);
  };

  const applyIspPreset = (tpl: typeof VN_ISP_TEMPLATES[0]) => {
    setPppoeForm((prev) => ({
      ...prev,
      name: tpl.name,
      badge: tpl.badge,
      vlanId: tpl.vlanId,
      iface: tpl.iface,
      username: tpl.username,
      password: tpl.password,
      mtu: tpl.mtu,
      distance: tpl.distance,
      recommendation: tpl.recommendation
    }));
  };

  // --- NAT rule handlers ---
  const handleOpenAddNat = () => {
    setEditingNat(null);
    setNatForm({
      chain: 'dstnat',
      proto: 'tcp',
      inInterface: 'ether1-WAN',
      dstPort: '443',
      toAddress: '10.10.100.10',
      toPort: '443',
      comment: 'Ingress Aegis Reverse Proxy',
      enabled: true
    });
    setShowNatModal(true);
  };

  const handleOpenEditNat = (rule: NatRule) => {
    setEditingNat(rule);
    setNatForm({
      chain: rule.chain,
      proto: rule.proto,
      inInterface: rule.inInterface,
      dstPort: rule.dstPort,
      toAddress: rule.toAddress,
      toPort: rule.toPort,
      comment: rule.comment,
      enabled: rule.enabled !== false
    });
    setShowNatModal(true);
  };

  const handleSaveNat = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNat) {
      onEditNatRule({
        ...editingNat,
        ...natForm
      });
    } else {
      onAddNatRule(natForm);
    }
    setShowNatModal(false);
  };

  const applyNatPreset = (p: typeof NAT_QUICK_PRESETS[0]) => {
    setNatForm((prev) => ({
      ...prev,
      proto: p.proto,
      dstPort: p.dstPort,
      toAddress: p.toAddress,
      toPort: p.toPort,
      comment: p.comment
    }));
  };

  // --- Conntrack Filtering ---
  const filteredConnections = useMemo(() => {
    return connections.filter((conn) => {
      // Protocol filter
      if (protoFilter !== 'all' && conn.protocol !== protoFilter) return false;
      // Mark filter
      if (markFilter !== 'all' && conn.mark !== markFilter) return false;
      // TCP State filter
      if (tcpStateFilter !== 'all' && conn.tcpState !== tcpStateFilter) return false;
      // Search input
      if (searchConn.trim() !== '') {
        const query = searchConn.toLowerCase();
        const matchSrc = `${conn.srcAddress}:${conn.srcPort || ''}`.toLowerCase().includes(query);
        const matchDst = `${conn.dstAddress}:${conn.dstPort || ''}`.toLowerCase().includes(query);
        const matchService = (conn.service || '').toLowerCase().includes(query);
        const matchId = conn.id.toLowerCase().includes(query);
        return matchSrc || matchDst || matchService || matchId;
      }
      return true;
    });
  }, [connections, protoFilter, markFilter, tcpStateFilter, searchConn]);

  const handleSelectIsp = (id: string) => {
    setActiveIspId(id);
    onSwitchIsp(id);
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. MIKROTIK ROUTEROS CHASSIS 24-PORT SWITCH VISUALIZER   */}
      {/* ========================================================= */}
      <div className="glass-panel rounded-xl border border-[#00f0ff]/20 bg-[#0b111a]/80 p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-[#00f0ff]" />
            <div>
              <h2 className="text-sm font-bold font-mono text-white tracking-wide">
                MIKROTIK ROUTEROS v7 RACKMOUNT CHASSIS VISUALIZER
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Hardware Switch Chip: Marvell Prestera DX | CPU: 4-Core ARM64 @ 1.4 GHz | RouterOS v7.16.2
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
            ROUTER CHR ACTIVE
          </span>
        </div>

        {/* Chassis Front Panel Representation */}
        <div className="mt-6 bg-[#04070b] border-2 border-slate-700 rounded-lg p-5 shadow-2xl relative">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2 font-bold text-white tracking-widest">
              <span className="text-[#00f0ff]">CCR2004-16G-2S+</span>
              <span className="text-slate-500 font-normal">| ROS v7.16.2 CHR Ingress</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-[#10b981]">
                <span className="w-2 h-2 rounded-full bg-[#10b981]" /> PWR1
              </span>
              <span className="flex items-center gap-1 text-[#10b981]">
                <span className="w-2 h-2 rounded-full bg-[#10b981]" /> PWR2 (Redundant)
              </span>
              <span className="flex items-center gap-1 text-[#00f0ff]">
                <span className="w-2 h-2 rounded-full bg-[#00f0ff] led-active" /> FAN 2800 RPM
              </span>
            </div>
          </div>

          {/* Ports Row */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5">
            {ports.map((port) => {
              const isSelected = selectedPort.id === port.id;
              const isUp = port.status === 'UP';

              return (
                <button
                  key={port.id}
                  onClick={() => setSelectedPort(port)}
                  className={`p-2 rounded-md border flex flex-col items-center justify-between text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#00f0ff] bg-[#00f0ff]/15 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                      : 'border-slate-800 bg-[#090e17] hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 mb-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isUp ? 'bg-[#10b981] led-active' : 'bg-slate-700'
                      }`}
                    />
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isUp ? 'bg-[#00f0ff] led-active' : 'bg-slate-800'
                      }`}
                    />
                  </div>

                  <div
                    className={`w-full py-1 px-1 rounded text-[10px] font-mono font-bold tracking-tight border ${
                      isUp
                        ? 'bg-[#0b111a] text-slate-200 border-slate-700'
                        : 'bg-black text-slate-600 border-slate-900'
                    }`}
                  >
                    {port.name}
                  </div>

                  <span className="text-[9px] font-mono text-slate-400 mt-1 truncate max-w-full">
                    {port.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Port Inspector Detail */}
          <div className="mt-4 p-3 bg-[#080d14] rounded border border-[#00f0ff]/30 text-xs font-mono grid grid-cols-2 sm:grid-cols-6 gap-3">
            <div>
              <span className="text-slate-500 block text-[10px]">SELECTED PORT</span>
              <span className="text-white font-bold">{selectedPort.name} ({selectedPort.label})</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">LINK STATUS</span>
              <span className={selectedPort.status === 'UP' ? 'text-[#10b981] font-bold' : 'text-slate-500'}>
                {selectedPort.status} ({selectedPort.speed})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ASSIGNED IP</span>
              <span className="text-[#00f0ff]">{selectedPort.ip || 'Unassigned / Trunk'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">VLAN ID</span>
              <span className="text-amber-400">VLAN {selectedPort.vlan}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">CURRENT RX</span>
              <span className="text-[#10b981]">{selectedPort.rx}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">CURRENT TX</span>
              <span className="text-blue-400">{selectedPort.tx}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. DUAL-WAN PPPOE ISP PROFILE MANAGEMENT (CRUD + PRESETS)  */}
      {/* ========================================================= */}
      <div className="glass-panel rounded-xl border border-[#00f0ff]/20 bg-[#0b111a]/80 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#00f0ff]" />
              ISP WAN PROFILES &amp; GPON FAILOVER (/INTERFACE PPPOE-CLIENT)
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Cấu hình quay số PPPoE FTTH chuẩn Việt Nam, hỗ trợ VLAN gắn Bridge và định tuyến tự động failover
            </p>
          </div>
          <button
            onClick={handleOpenAddPppoe}
            className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00f0ff]/15 hover:bg-[#00f0ff]/25 text-[#00f0ff] border border-[#00f0ff]/40 text-xs font-mono font-bold transition-all shadow-[0_0_10px_rgba(0,240,255,0.15)]"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm Kết Nối PPPoE
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {pppoeProfiles.map((isp) => {
            const isActive = activeIspId === isp.id;

            return (
              <div
                key={isp.id}
                className={`p-4 rounded-xl border font-mono text-xs flex flex-col justify-between transition-all relative ${
                  isActive
                    ? 'border-[#00f0ff] bg-[#00f0ff]/10 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                    : 'border-slate-800 bg-[#06090e]/70 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-sm block">{isp.name}</span>
                      <span className="text-[10px] text-slate-400">{isp.badge}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                          isActive
                            ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {isActive ? 'ACTIVE ROUTE' : 'STANDBY'}
                      </span>
                      <button
                        onClick={() => handleOpenEditPppoe(isp)}
                        title="Chỉnh sửa hồ sơ PPPoE"
                        className="cursor-pointer p-1 text-slate-400 hover:text-[#00f0ff] hover:bg-[#00f0ff]/10 rounded border border-transparent hover:border-[#00f0ff]/30 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {pppoeProfiles.length > 1 && (
                        <button
                          onClick={() => onDeletePppoe(isp.id)}
                          title="Xóa hồ sơ PPPoE"
                          className="cursor-pointer p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded border border-transparent hover:border-rose-500/30 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Interface &amp; VLAN:</span>
                      <span className="text-white font-semibold">{isp.iface} <span className="text-amber-400">(VLAN {isp.vlanId})</span></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">PPPoE User:</span>
                      <span className="text-[#00f0ff]">{isp.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">IP / Gateway:</span>
                      <span className="text-slate-200">{isp.ipAddress || '118.69.x.x'} / {isp.gateway || '118.69.x.1'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">MTU / Metric:</span>
                      <span>{isp.mtu} / Distance {isp.distance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Uptime:</span>
                      <span className="text-[#10b981]">{isp.uptime || 'Active'}</span>
                    </div>
                  </div>

                  <p className="mt-3 text-[11px] text-slate-400 bg-[#06090e] p-2.5 rounded border border-slate-800">
                    {isp.recommendation}
                  </p>
                </div>

                <button
                  onClick={() => handleSelectIsp(isp.id)}
                  disabled={isActive}
                  className={`mt-4 w-full py-2 rounded text-xs font-bold transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/40 cursor-default'
                      : 'bg-slate-800 hover:bg-[#00f0ff]/20 text-slate-300 hover:text-[#00f0ff] border-slate-700'
                  }`}
                >
                  {isActive ? 'CURRENTLY CONNECTED' : 'SWITCH ROUTE TO THIS ISP'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. DHCP LEASES & FASTTRACK TABLE                         */}
      {/* ========================================================= */}
      <div className="glass-panel rounded-xl border border-[#00f0ff]/20 bg-[#0b111a]/80 p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#10b981]" />
              DHCP LEASES &amp; FASTTRACK HARDWARE ACCELERATION
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              FastTrack bypasses Linux conntrack CPU queue for verified established connections
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Pool: <code>10.10.1.100 - 10.10.1.250</code>
          </span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#06090e] text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">IP Address</th>
                <th className="py-2.5 px-3">MAC Address</th>
                <th className="py-2.5 px-3">Hostname</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Lease Expiry</th>
                <th className="py-2.5 px-3 text-right">L3 FastTrack</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {leases.map((lease) => (
                <tr key={lease.id} className="hover:bg-[#0f1724]/60 transition-colors">
                  <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                    {lease.ip}
                  </td>
                  <td className="py-3 px-3 text-slate-400">{lease.mac}</td>
                  <td className="py-3 px-3 text-slate-200">{lease.hostname}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                      {lease.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-amber-400">{lease.expires}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onToggleFastTrack(lease.id)}
                      className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-700 bg-slate-800 hover:border-[#00f0ff] transition-all"
                    >
                      {lease.fastTrack ? (
                        <>
                          <span className="text-[#10b981] font-bold">ENABLED</span>
                          <ToggleRight className="w-4 h-4 text-[#10b981]" />
                        </>
                      ) : (
                        <>
                          <span className="text-slate-400">DISABLED</span>
                          <ToggleLeft className="w-4 h-4 text-slate-500" />
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. NAT PORT FORWARDING (DST-NAT) TABLE & TEMPLATES       */}
      {/* ========================================================= */}
      <div className="glass-panel rounded-xl border border-[#00f0ff]/20 bg-[#0b111a]/80 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00f0ff]" />
              MIKROTIK FIREWALL NAT TABLE &amp; PORT FORWARDING (CHAIN: DSTNAT)
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Quản lý mở cổng dịch vụ, bảo vệ chống lách DNS Anti-Bypass và điều phối Ingress Traffic
            </p>
          </div>
          <button
            onClick={handleOpenAddNat}
            className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00f0ff]/15 hover:bg-[#00f0ff]/25 text-[#00f0ff] border border-[#00f0ff]/40 text-xs font-mono font-bold transition-all shadow-[0_0_10px_rgba(0,240,255,0.15)]"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm Quy Tắc Port Forward
          </button>
        </div>

        {/* Quick NAT Presets bar */}
        <div className="mt-4 p-3 bg-[#06090e] rounded-lg border border-slate-800 flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5 mr-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Mẫu Mở Nhanh Cổng:
          </span>
          {NAT_QUICK_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setEditingNat(null);
                setNatForm({
                  chain: 'dstnat',
                  proto: p.proto,
                  inInterface: 'ether1-WAN',
                  dstPort: p.dstPort,
                  toAddress: p.toAddress,
                  toPort: p.toPort,
                  comment: p.comment,
                  enabled: true
                });
                setShowNatModal(true);
              }}
              className="cursor-pointer px-2.5 py-1 rounded bg-slate-900 hover:bg-[#00f0ff]/15 text-slate-300 hover:text-[#00f0ff] border border-slate-700 hover:border-[#00f0ff]/40 transition-all"
            >
              + {p.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#06090e] text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Trạng Thái</th>
                <th className="py-2.5 px-3">Protocol</th>
                <th className="py-2.5 px-3">In-Interface</th>
                <th className="py-2.5 px-3">Dst-Port</th>
                <th className="py-2.5 px-3">Redirect Target</th>
                <th className="py-2.5 px-3">Mô Tả / Phân Loại</th>
                <th className="py-2.5 px-3 text-right">Packets Hit</th>
                <th className="py-2.5 px-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {natRules.map((rule) => {
                const isDnsRule = rule.dstPort === '53' || rule.comment.includes('Anti-Bypass');
                const isEnabled = rule.enabled !== false;

                return (
                  <tr
                    key={rule.id}
                    className={`transition-colors ${
                      !isEnabled ? 'opacity-40 bg-black/40' : 'hover:bg-[#0f1724]/60'
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-slate-400">{rule.id}</td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => onToggleNatRule(rule.id)}
                        className="cursor-pointer inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] border border-slate-700 bg-slate-800 hover:border-[#00f0ff] transition-all"
                      >
                        {isEnabled ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                            <span className="text-[#10b981] font-bold">BẬT</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                            <span className="text-slate-400">TẮT</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-3 uppercase font-bold text-[#00f0ff]">{rule.proto}</td>
                    <td className="py-3 px-3 text-slate-300">{rule.inInterface}</td>
                    <td className="py-3 px-3 text-white font-bold">{rule.dstPort}</td>
                    <td className="py-3 px-3 text-[#10b981] font-bold">
                      {rule.toAddress}:{rule.toPort}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      <div className="flex items-center gap-2">
                        {isDnsRule && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-[#10b981] border border-emerald-500/30 text-[9px] font-bold">
                            DNS PROTECT
                          </span>
                        )}
                        <span className="truncate max-w-xs">{rule.comment}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      {rule.packets.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditNat(rule)}
                          title="Sửa quy tắc"
                          className="cursor-pointer p-1 text-slate-400 hover:text-[#00f0ff] hover:bg-[#00f0ff]/10 rounded border border-transparent hover:border-[#00f0ff]/30 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteNatRule(rule.id)}
                          title="Xóa quy tắc"
                          className="cursor-pointer p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded border border-transparent hover:border-rose-500/30 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. CONNECTION LIST (FIREWALL CONNTRACK ACTIVE SESSIONS)   */}
      {/* ========================================================= */}
      <div className="glass-panel rounded-xl border border-[#00f0ff]/20 bg-[#0b111a]/80 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00f0ff]" />
              ACTIVE CONNECTION TRACKING (/IP FIREWALL CONNECTION)
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Theo dõi trực tiếp các phiên conntrack, giám sát trạng thái TCP, lưu lượng và ngắt kết nối theo yêu cầu
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="px-2.5 py-1 rounded bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30">
              Tổng phiên: <strong>{connections.length}</strong>
            </span>
            <span className="px-2.5 py-1 rounded bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30">
              FastTrack: <strong>{connections.filter((c) => c.mark === 'FastTrack').length}</strong>
            </span>
            <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Giám sát DDoS: <strong>{connections.filter((c) => c.mark === 'DDoS_Monitored').length}</strong>
            </span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm IP, port, dịch vụ..."
              value={searchConn}
              onChange={(e) => setSearchConn(e.target.value)}
              className="w-full bg-[#06090e] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#00f0ff]"
            />
          </div>

          <div>
            <select
              value={protoFilter}
              onChange={(e) => setProtoFilter(e.target.value as any)}
              className="w-full bg-[#06090e] border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-[#00f0ff]"
            >
              <option value="all">Giao thức: Tất cả</option>
              <option value="tcp">TCP</option>
              <option value="udp">UDP</option>
              <option value="icmp">ICMP</option>
            </select>
          </div>

          <div>
            <select
              value={tcpStateFilter}
              onChange={(e) => setTcpStateFilter(e.target.value)}
              className="w-full bg-[#06090e] border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-[#00f0ff]"
            >
              <option value="all">Trạng thái TCP: Tất cả</option>
              <option value="ESTABLISHED">ESTABLISHED</option>
              <option value="TIME_WAIT">TIME_WAIT</option>
              <option value="SYN_SENT">SYN_SENT</option>
              <option value="SYN_RECV">SYN_RECV</option>
              <option value="CLOSE_WAIT">CLOSE_WAIT</option>
            </select>
          </div>

          <div>
            <select
              value={markFilter}
              onChange={(e) => setMarkFilter(e.target.value)}
              className="w-full bg-[#06090e] border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-[#00f0ff]"
            >
              <option value="all">Connection Mark: Tất cả</option>
              <option value="FastTrack">FastTrack (Hardware Offload)</option>
              <option value="Standard">Standard</option>
              <option value="Prio_VoIP">Prio_VoIP (QoS Voice)</option>
              <option value="DDoS_Monitored">DDoS_Monitored (Threat Inspection)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#06090e] text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Proto</th>
                <th className="py-2.5 px-3">Source Address</th>
                <th className="py-2.5 px-3"></th>
                <th className="py-2.5 px-3">Destination Address</th>
                <th className="py-2.5 px-3">TCP State</th>
                <th className="py-2.5 px-3">Timeout</th>
                <th className="py-2.5 px-3">Lưu Lượng</th>
                <th className="py-2.5 px-3">Connection Mark</th>
                <th className="py-2.5 px-3">Dịch Vụ / Nhận Diện</th>
                <th className="py-2.5 px-3 text-right">Kill Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredConnections.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-6 text-center text-slate-500 font-mono">
                    Không tìm thấy phiên kết nối nào khớp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredConnections.map((conn) => {
                  const isDdos = conn.mark === 'DDoS_Monitored';
                  const isVoip = conn.mark === 'Prio_VoIP';
                  const isFast = conn.mark === 'FastTrack';

                  return (
                    <tr
                      key={conn.id}
                      className={`hover:bg-[#0f1724]/70 transition-colors ${
                        isDdos ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="py-3 px-3 uppercase font-bold">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            conn.protocol === 'tcp'
                              ? 'bg-blue-500/20 text-blue-400'
                              : conn.protocol === 'udp'
                              ? 'bg-emerald-500/20 text-[#10b981]'
                              : 'bg-purple-500/20 text-purple-400'
                          }`}
                        >
                          {conn.protocol}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">
                        {conn.srcAddress}
                        {conn.srcPort ? (
                          <span className="text-[#00f0ff]">:{conn.srcPort}</span>
                        ) : null}
                      </td>
                      <td className="py-3 px-1 text-slate-600">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">
                        {conn.dstAddress}
                        {conn.dstPort ? (
                          <span className="text-amber-400">:{conn.dstPort}</span>
                        ) : null}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {conn.tcpState ? (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              conn.tcpState === 'ESTABLISHED'
                                ? 'bg-emerald-500/15 text-[#10b981]'
                                : conn.tcpState === 'TIME_WAIT'
                                ? 'bg-slate-800 text-slate-400'
                                : 'bg-amber-500/15 text-amber-400'
                            }`}
                          >
                            {conn.tcpState}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-400">{conn.timeout}</td>
                      <td className="py-3 px-3 text-slate-300">
                        <span className="text-blue-400">↑ {conn.origBytes}</span> /{' '}
                        <span className="text-[#10b981]">↓ {conn.replyBytes}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isFast
                              ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/40'
                              : isDdos
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              : isVoip
                              ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {conn.mark}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300 truncate max-w-xs">
                        {conn.service || 'Normal Packet Flow'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onKillConnection(conn.id)}
                          title="Hủy phiên kết nối này (Drop / Kill Conntrack)"
                          className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-[10px] font-bold transition-all shadow-sm"
                        >
                          <XCircle className="w-3 h-3" />
                          Kill
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: THÊM / CHỈNH SỬA PPPOE CONNECTION                   */}
      {/* ========================================================= */}
      {showPppoeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b111a] border border-[#00f0ff]/30 rounded-xl max-w-2xl w-full p-6 shadow-2xl font-mono text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#00f0ff]" />
                <h3 className="text-sm font-bold text-white">
                  {editingPppoe ? 'CẬP NHẬT KẾT NỐI PPPOE FTTH' : 'THÊM MỚI KẾT NỐI PPPOE CLIENT'}
                </h3>
              </div>
              <button
                onClick={() => setShowPppoeModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Quick Templates Bar */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1.5">
                Chọn Mẫu Cấu Hình Chuẩn Nhà Mạng VN:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {VN_ISP_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.provider}
                    type="button"
                    onClick={() => applyIspPreset(tpl)}
                    className="p-2 rounded border border-slate-700 bg-slate-900/80 hover:border-[#00f0ff] hover:bg-[#00f0ff]/10 text-left transition-all cursor-pointer"
                  >
                    <span className="font-bold text-white block">{tpl.provider}</span>
                    <span className="text-[10px] text-amber-400">VLAN {tpl.vlanId} | MTU {tpl.mtu}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSavePppoe} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Tên Kết Nối / Profile Name</label>
                  <input
                    type="text"
                    required
                    value={pppoeForm.name}
                    onChange={(e) => setPppoeForm({ ...pppoeForm, name: e.target.value })}
                    className="w-full bg-[#06090e] border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Interface Vật Lý / Cổng WAN</label>
                  <select
                    value={pppoeForm.iface}
                    onChange={(e) => setPppoeForm({ ...pppoeForm, iface: e.target.value })}
                    className="w-full bg-[#06090e] border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-[#00f0ff]"
                  >
                    <option value="ether1">ether1 (WAN 1)</option>
                    <option value="ether4">ether4 (WAN 2 / Failover)</option>
                    <option value="sfp-sfpplus1">sfp-sfpplus1 (10G Fiber SFP+)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Tài Khoản PPPoE Username</label>
                  <input
                    type="text"
                    required
                    value={pppoeForm.username}
                    onChange={(e) => setPppoeForm({ ...pppoeForm, username: e.target.value })}
                    className="w-full bg-[#06090e] border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Mật Khẩu PPPoE Password</label>
                  <div className="relative">
                    <input
                      type={showPppoePassword ? 'text' : 'password'}
                      value={pppoeForm.password || ''}
                      onChange={(e) => setPppoeForm({ ...pppoeForm, password: e.target.value })}
                      className="w-full bg-[#06090e] border border-slate-800 rounded p-2 text-white pr-9 focus:outline-none focus:border-[#00f0ff]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPppoePassword(!showPppoePassword)}
                      className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white"
                    >
                      {showPppoePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">VLAN ID (GPON)</label>
                  <input
                    type="number"
                    value={pppoeForm.vlanId}
                    onChange={(e) => setPppoeForm({ ...pppoeForm, vlanId: Number(e.target.value) })}
                    className="w-full bg-[#06090e] border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">MTU / MRU</label>
                  <input
                    type="number"
                    value={pppoeForm.mtu}
                    onChange={(e) => setPppoeForm({ ...pppoeForm, mtu: Number(e.target.value) })}
                    className="w-full bg-[#06090e] border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Metric (Distance)</label>
                  <input
                    type="number"
                    value={pppoeForm.distance}
                    onChange={(e) => setPppoeForm({ ...pppoeForm, distance: Number(e.target.value) })}
                    className="w-full bg-[#06090e] border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
              </div>

              {/* RouterOS CLI Preview & Copy */}
              <div className="p-3 bg-[#04070b] border border-slate-800 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5 text-[#00f0ff] font-bold">
                    <Terminal className="w-3.5 h-3.5" />
                    RouterOS v7 CLI Command Preview:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCli}
                    className="cursor-pointer flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-[#00f0ff]/20 text-slate-300 hover:text-[#00f0ff] transition-all"
                  >
                    {copiedCli ? <Check className="w-3 h-3 text-[#10b981]" /> : <Copy className="w-3 h-3" />}
                    {copiedCli ? 'Đã sao chép' : 'Copy Lệnh'}
                  </button>
                </div>
                <code className="block text-[10px] text-emerald-400 break-all bg-black/60 p-2 rounded border border-slate-900 font-mono">
                  {generatedPppoeCli}
                </code>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPppoeModal(false)}
                  className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-black font-bold cursor-pointer transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                >
                  {editingPppoe ? 'Lưu Cập Nhật' : 'Tạo Kết Nối PPPoE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: THÊM / CHỈNH SỬA NAT PORT FORWARDING               */}
      {/* ========================================================= */}
      {showNatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b111a] border border-[#00f0ff]/30 rounded-xl max-w-xl w-full p-6 shadow-2xl font-mono text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#00f0ff]" />
                <h3 className="text-sm font-bold text-white">
                  {editingNat ? `CHỈNH SỬA QUY TẮC NAT PORT #${editingNat.id}` : 'THÊM MỚI QUY TẮC NAT PORT FORWARDING'}
                </h3>
              </div>
              <button
                onClick={() => setShowNatModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Quick Presets selector inside modal */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1.5">
                Chọn mẫu dịch vụ nhanh:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {NAT_QUICK_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyNatPreset(p)}
                    className="px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:border-[#00f0ff] text-[10px] text-slate-300 hover:text-[#00f0ff] transition-all cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveNat} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Giao Thức (Protocol)</label>
                  <select
                    value={natForm.proto}
                    onChange={(e) => setNatForm({ ...natForm, proto: e.target.value as any })}
                    className="w-full bg-[#06090e] border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-[#00f0ff]"
                  >
                    <option value="tcp">TCP</option>
                    <option value="udp">UDP</option>
                    <option value="all">ALL (TCP &amp; UDP)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">In-Interface Cổng Vào</label>
                  <select
                    value={natForm.inInterface}
                    onChange={(e) => setNatForm({ ...natForm, inInterface: e.target.value })}
                    className="w-full bg-[#06090e] border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-[#00f0ff]"
                  >
                    <option value="ether1-WAN">ether1-WAN (Cổng Internet Ngoài)</option>
                    <option value="ether2-LAN">ether2-LAN (Mạng Nội Bộ LAN)</option>
                    <option value="all-ethernet">all-ethernet</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Dst-Port (Cổng Ngoài Đón Ingress)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 443 hoặc 80,443"
                    value={natForm.dstPort}
                    onChange={(e) => setNatForm({ ...natForm, dstPort: e.target.value })}
                    className="w-full bg-[#06090e] border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">To-Port (Cổng Đích Trong Máy Chủ)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 443"
                    value={natForm.toPort}
                    onChange={(e) => setNatForm({ ...natForm, toPort: e.target.value })}
                    className="w-full bg-[#06090e] border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">To-Address (IP Máy Chủ Đích Trong LAN)</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 10.10.100.10"
                  value={natForm.toAddress}
                  onChange={(e) => setNatForm({ ...natForm, toAddress: e.target.value })}
                  className="w-full bg-[#06090e] border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Mô Tả / Ghi Chú Quy Tắc</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Ingress Aegis Cyber-NOC Reverse Proxy"
                  value={natForm.comment}
                  onChange={(e) => setNatForm({ ...natForm, comment: e.target.value })}
                  className="w-full bg-[#06090e] border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNatModal(false)}
                  className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-black font-bold cursor-pointer transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                >
                  {editingNat ? 'Lưu Thay Đổi' : 'Tạo Quy Tắc Port'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import {
  Globe,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Search,
  Gamepad2,
  Bot,
  Share2,
  DownloadCloud,
  MessageSquare,
  PlayCircle,
  EyeOff,
  Key,
  CheckCircle2,
  XCircle,
  Clock,
  ToggleLeft,
  ToggleRight,
  Server,
  Cpu,
  Lock,
  Layers,
  Settings,
  Sliders,
  Filter,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  Smartphone,
  Laptop,
  Tv,
  Check,
  AlertCircle
} from 'lucide-react';
import { DnsStats, BlockedService, DnsQueryLog, DnsRewrite } from '../../types';

interface DnsTabProps {
  stats: DnsStats;
  services: BlockedService[];
  queryLog: DnsQueryLog[];
  rewrites: DnsRewrite[];
  onToggleService: (id: string) => void;
}

export const DnsTab: React.FC<DnsTabProps> = ({
  stats,
  services,
  queryLog,
  rewrites,
  onToggleService,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'services' | 'filters' | 'rewrites' | 'engine' | 'logs'
  >('overview');

  // Subtab 2: Schedule Pause State
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [scheduleFrom, setScheduleFrom] = useState('19:00');
  const [scheduleTo, setScheduleTo] = useState('21:30');
  const [serviceSearch, setServiceSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Subtab 2: Complete 12 Categories Definition (from AdGuard Home)
  const serviceCategories = [
    {
      id: 'ai',
      name: 'Artificial intelligence',
      hasBulk: true,
      icon: Bot,
      services: [
        'ChatGPT',
        'Claude',
        'Copilot',
        'DeepSeek',
        'Google Gemini',
        'Grok',
        'Manus',
        'Meta AI',
        'Perplexity',
      ],
    },
    {
      id: 'cdn',
      name: 'Content delivery networks (CDN)',
      hasBulk: false,
      icon: Server,
      services: ['Cloudflare'],
    },
    {
      id: 'dating',
      name: 'Dating services',
      hasBulk: true,
      icon: EyeOff,
      services: ['Grindr', 'Plenty of Fish', 'Tinder', 'Wizz'],
    },
    {
      id: 'gambling',
      name: 'Gambling and betting',
      hasBulk: true,
      icon: AlertCircle,
      services: ['Betano', 'Betfair', 'Betway', 'Blaze', 'FDJ United'],
    },
    {
      id: 'gaming',
      name: 'Gaming',
      hasBulk: true,
      icon: Gamepad2,
      services: [
        'Activision Blizzard',
        'Battle.net',
        'Blizzard Entertainment',
        'Electronic Arts',
        'Epic Games',
        'GOG',
        'IO Interactive',
        'League of Legends',
        'Minecraft',
        'Nintendo',
        'Origin',
        'PlayStation',
        'Riot Games',
        'Roblox',
        'Rockstar Games',
        'Shell Shockers',
        'Steam',
        'Ubisoft',
        'Valorant',
        'Wargaming',
        'Warner Bros. Games',
        'Xbox Live',
      ],
    },
    {
      id: 'hosting',
      name: 'Web hosting',
      hasBulk: true,
      icon: DownloadCloud,
      services: ['Box', 'Dropbox', 'Flickr', 'Imgur'],
    },
    {
      id: 'messaging',
      name: 'Messaging services',
      hasBulk: true,
      icon: MessageSquare,
      services: [
        'KakaoTalk',
        'Kik',
        'MAX',
        'Microsoft Teams',
        'Olvid',
        'Signal',
        'Skype',
        'Slack',
        'Telegram (Web)',
        'Viber',
        'WeChat',
        'WhatsApp',
      ],
    },
    {
      id: 'privacy',
      name: 'Privacy tools',
      hasBulk: true,
      icon: Lock,
      services: ['iCloud Private Relay', 'Privacy', 'Proton'],
    },
    {
      id: 'shopping',
      name: 'Shopping',
      hasBulk: true,
      icon: Globe,
      services: [
        'AliExpress',
        'Amazon',
        'CoolApk',
        'eBay',
        'Lazada',
        'Mercado Libre',
        'Shein',
        'Shopee',
        'Temu',
        'Xiaohongshu',
      ],
    },
    {
      id: 'social',
      name: 'Social networks',
      hasBulk: true,
      icon: Share2,
      services: [
        '4chan',
        '500px',
        '9GAG',
        'Amino',
        'Bluesky',
        'Clubhouse',
        'Discord',
        'Douban',
        'Facebook',
        'Instagram',
        'KOOK',
        'LINE',
        'LinkedIn',
        'Mail.ru',
        'Mastodon',
        'Odysee',
        'OK.ru',
        'OnlyFans',
        'Pinterest',
        'Reddit',
        'Snapchat',
        'TikTok',
        'Tumblr',
        'X (formerly Twitter)',
        'VK.com',
        'Zhihu',
      ],
    },
    {
      id: 'software',
      name: 'Software development',
      hasBulk: true,
      icon: Cpu,
      services: ['Nvidia', 'Google Play Store'],
    },
    {
      id: 'streaming',
      name: 'Streaming services',
      hasBulk: true,
      icon: PlayCircle,
      services: [
        'Amazon Streaming',
        'Apple Streaming',
        'Bigo Live',
        'Bilibili',
        'Canais Globo',
        'Claro',
        'Crunchyroll',
        'Dailymotion',
        'Deezer',
        'DirecTV Go',
        'Discovery+',
        'Disney+',
        'ESPN',
        'FIFA',
        'Globoplay',
        'HBO Max',
        'Hulu',
        'iHeartRadio',
        'iQIYI',
        'Lionsgate+',
        'Looke',
        'Nebula',
        'Netflix',
        'Paramount Plus',
        'Peacock TV',
        'Plex',
        'Pluto TV',
        'QQ',
        'Rakuten Viki',
        'Samsung TV Plus',
        'SoundCloud',
        'Spotify',
        'Spotify Video',
        'Tidal',
        'Twitch',
        'Vimeo',
        'Vivo Play',
        'Voot',
        'Weibo',
        'YouTube',
        'YY',
      ],
    },
  ];

  // Subtab 2: Complete 139 Services State
  const [appStates, setAppStates] = useState<Record<string, boolean>>({
    // Artificial intelligence
    ChatGPT: false,
    Claude: false,
    Copilot: false,
    DeepSeek: false,
    'Google Gemini': false,
    Grok: false,
    Manus: false,
    'Meta AI': false,
    Perplexity: false,
    // Content delivery networks (CDN)
    Cloudflare: false,
    // Dating services
    Grindr: true,
    'Plenty of Fish': true,
    Tinder: true,
    Wizz: true,
    // Gambling and betting
    Betano: true,
    Betfair: true,
    Betway: true,
    Blaze: true,
    'FDJ United': true,
    // Gaming
    'Activision Blizzard': false,
    'Battle.net': false,
    'Blizzard Entertainment': false,
    'Electronic Arts': false,
    'Epic Games': false,
    GOG: false,
    'IO Interactive': false,
    'League of Legends': false,
    Minecraft: true,
    Nintendo: false,
    Origin: false,
    PlayStation: false,
    'Riot Games': false,
    Roblox: true,
    'Rockstar Games': false,
    'Shell Shockers': true,
    Steam: false,
    Ubisoft: false,
    Valorant: false,
    Wargaming: false,
    'Warner Bros. Games': false,
    'Xbox Live': false,
    // Web hosting
    Box: false,
    Dropbox: false,
    Flickr: false,
    Imgur: false,
    // Messaging services
    KakaoTalk: false,
    Kik: false,
    MAX: false,
    'Microsoft Teams': false,
    Olvid: false,
    Signal: false,
    Skype: false,
    Slack: false,
    'Telegram (Web)': false,
    Viber: false,
    WeChat: false,
    WhatsApp: false,
    // Privacy tools
    'iCloud Private Relay': true,
    Privacy: false,
    Proton: false,
    // Shopping
    AliExpress: false,
    Amazon: false,
    CoolApk: false,
    eBay: false,
    Lazada: false,
    'Mercado Libre': false,
    Shein: false,
    Shopee: false,
    Temu: false,
    Xiaohongshu: false,
    // Social networks
    '4chan': true,
    '500px': false,
    '9GAG': false,
    Amino: false,
    Bluesky: false,
    Clubhouse: false,
    Discord: false,
    Douban: false,
    Facebook: false,
    Instagram: false,
    KOOK: false,
    LINE: false,
    LinkedIn: false,
    'Mail.ru': false,
    Mastodon: false,
    Odysee: false,
    'OK.ru': false,
    OnlyFans: true,
    Pinterest: false,
    Reddit: false,
    Snapchat: false,
    TikTok: true,
    Tumblr: false,
    'X (formerly Twitter)': false,
    'VK.com': false,
    Zhihu: false,
    // Software development
    Nvidia: false,
    'Google Play Store': false,
    // Streaming services
    'Amazon Streaming': false,
    'Apple Streaming': false,
    'Bigo Live': true,
    Bilibili: false,
    'Canais Globo': false,
    Claro: false,
    Crunchyroll: false,
    Dailymotion: false,
    Deezer: false,
    'DirecTV Go': false,
    'Discovery+': false,
    'Disney+': false,
    ESPN: false,
    FIFA: false,
    Globoplay: false,
    'HBO Max': false,
    Hulu: false,
    iHeartRadio: false,
    iQIYI: false,
    'Lionsgate+': false,
    Looke: false,
    Nebula: false,
    Netflix: false,
    'Paramount Plus': false,
    'Peacock TV': false,
    Plex: false,
    'Pluto TV': false,
    QQ: false,
    'Rakuten Viki': false,
    'Samsung TV Plus': false,
    SoundCloud: false,
    Spotify: false,
    'Spotify Video': false,
    Tidal: false,
    Twitch: false,
    Vimeo: false,
    'Vivo Play': false,
    Voot: false,
    Weibo: false,
    YouTube: false,
    YY: false,
  });

  // Subtab 3: Diagnostic Check State
  const [diagDomain, setDiagDomain] = useState('tiktok.com');
  const [diagResult, setDiagResult] = useState<{
    tested: boolean;
    domain: string;
    blocked: boolean;
    reason: string;
    rule: string;
  }>({
    tested: true,
    domain: 'tiktok.com',
    blocked: true,
    reason: 'DỊCH VỤ: TikTok (Blocked Services)',
    rule: '||tiktok.com^',
  });

  // Subtab 3: Blocklists
  const [blocklists, setBlocklists] = useState([
    {
      id: '1',
      name: 'Aegis Base DNS Security Filter',
      desc: 'Chặn quảng cáo, theo dõi và popup độc hại toàn cầu',
      url: 'https://adguardteam.github.io/HostlistsRegistry/assets/filter_1.txt',
      rules: '64,812 rules',
      updated: '2 giờ trước',
      enabled: true,
    },
    {
      id: '2',
      name: 'ChongLuaDao.vn (Chống Lừa Đảo VN)',
      desc: 'Dữ liệu chống lừa đảo, cờ bạc, website giả mạo ngân hàng tại VN',
      url: 'https://raw.githubusercontent.com/chongluadao/hosts/master/hosts',
      rules: '18,920 rules',
      updated: '1 giờ trước',
      enabled: true,
    },
    {
      id: '3',
      name: 'OISD Blocklist Full',
      desc: 'Danh sách siêu cấp chống rác & telemetry toàn diện',
      url: 'https://big.oisd.nl',
      rules: '132,450 rules',
      updated: 'Hôm qua',
      enabled: true,
    },
    {
      id: '4',
      name: "Dan Pollock's Hosts",
      desc: 'Chuyên trị malware, spyware, trojan C2 servers',
      url: 'https://someonewhocares.org/hosts/zero/hosts',
      rules: '14,200 rules',
      updated: '3 ngày trước',
      enabled: true,
    },
  ]);

  // Subtab 3: Custom Rules
  const [customRules, setCustomRules] = useState(
    `! Aegis Custom DNS Rules\n||tracking.custom-adserver.net^\n||telemetry.windows.internal^\n@@||authorized-school.edu.vn^\n127.0.0.1 c2-ransomware-domain.org\n/popup-ad-[0-9]+\\.online/`
  );

  // Subtab 4: Cache Settings
  const [cacheSize, setCacheSize] = useState('64 MB');
  const [minTtl, setMinTtl] = useState(300);
  const [maxTtl, setMaxTtl] = useState(86400);
  const [optimisticCache, setOptimisticCache] = useState(true);

  // Subtab 5: Upstream Servers State
  const [upstreams, setUpstreams] = useState(
    `https://dns.cloudflare.com/dns-query\nhttps://dns.google/dns-query\ntls://dns.quad9.net\nquic://dns.adguard-dns.com`
  );
  const [upstreamMode, setUpstreamMode] = useState<'parallel' | 'loadbalance' | 'fastest'>('parallel');
  const [dnssecEnabled, setDnssecEnabled] = useState(true);
  const [disableIpv6, setDisableIpv6] = useState(false);
  const [rateLimit, setRateLimit] = useState(20);
  const [blockingMode, setBlockingMode] = useState('default');
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);

  // Subtab 6: Live Query Log State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const toggleApp = (name: string) => {
    setAppStates((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const toggleCategory = (apps: string[], block: boolean) => {
    setAppStates((prev) => {
      const updated = { ...prev };
      apps.forEach((a) => {
        updated[a] = block;
      });
      return updated;
    });
  };

  const runDomainCheck = () => {
    if (!diagDomain.trim()) return;
    const d = diagDomain.toLowerCase().trim();
    if (d.includes('tiktok') || d.includes('roblox') || d.includes('bet') || d.includes('scam') || d.includes('torrent')) {
      setDiagResult({
        tested: true,
        domain: d,
        blocked: true,
        reason: 'Khớp danh sách ứng dụng bị hạn chế hoặc lừa đảo',
        rule: `||${d}^`,
      });
    } else {
      setDiagResult({
        tested: true,
        domain: d,
        blocked: false,
        reason: 'Tên miền hợp lệ, được phép phân giải qua Upstream',
        rule: 'ALLOW (Passed Filters)',
      });
    }
  };

  const filteredLogs = queryLog.filter((log) => {
    const matchesSearch =
      log.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.clientIp.includes(searchQuery);
    const matchesStatus = filterStatus === 'ALL' || log.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Subnav Navigation Pills (6 Full Subpages) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'overview'
                ? 'bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/40 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f1724]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            📊 TỔNG QUAN &amp; THỐNG KÊ
          </button>

          <button
            onClick={() => setActiveSubTab('services')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'services'
                ? 'bg-red-500/15 text-red-400 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f1724]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            🚫 CHẶN ỨNG DỤNG &amp; LỊCH TRÌNH
          </button>

          <button
            onClick={() => setActiveSubTab('filters')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'filters'
                ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f1724]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            📋 BỘ LỌC &amp; KIỂM TRA
          </button>

          <button
            onClick={() => setActiveSubTab('rewrites')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'rewrites'
                ? 'bg-[#8b5cf6]/15 text-[#8b5cf6] border border-[#8b5cf6]/40 shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f1724]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            🔀 DNS REWRITES &amp; CACHE
          </button>

          <button
            onClick={() => setActiveSubTab('engine')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'engine'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f1724]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            ⚙️ CẤU HÌNH MÁY CHỦ &amp; UPSTREAM
          </button>

          <button
            onClick={() => setActiveSubTab('logs')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'logs'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f1724]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            📜 NHẬT KÝ TRUY VẤN
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#10b981] bg-[#10b981]/10 px-2.5 py-1 rounded border border-[#10b981]/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
            PORT 53 / 853 / 443 ACTIVE
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SUBPAGE 1: OVERVIEW & STATISTICS                         */}
      {/* ======================================================== */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 KPI Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-xl border border-[#00f0ff]/20 bg-[#0b111a]/80">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>TỔNG TRUY VẤN DNS (24H)</span>
                <Globe className="w-4 h-4 text-[#00f0ff]" />
              </div>
              <div className="mt-2 text-2xl font-mono font-bold text-white">
                1,248,930
              </div>
              <div className="mt-2 text-[11px] font-mono text-[#10b981]">
                ▲ +12.4% so với hôm qua
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-red-500/20 bg-[#0b111a]/80">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>BỊ CHẶN BỞI BỘ LỌC</span>
                <ShieldAlert className="w-4 h-4 text-red-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-mono font-bold text-white">
                  184,210
                </span>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  (14.75%)
                </span>
              </div>
              <div className="mt-2 text-[11px] font-mono text-slate-400">
                Quảng cáo, Theo dõi &amp; Dịch vụ chặn
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-amber-500/20 bg-[#0b111a]/80">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>MÃ ĐỘC &amp; PHISHING CHẶN</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-2 text-2xl font-mono font-bold text-white">
                4,892
              </div>
              <div className="mt-2 text-[11px] font-mono text-slate-400">
                ChongLuaDao.vn &amp; Dan Pollock
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-pink-500/20 bg-[#0b111a]/80">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>TRANG WEB NGƯỜI LỚN CHẶN</span>
                <Lock className="w-4 h-4 text-pink-400" />
              </div>
              <div className="mt-2 text-2xl font-mono font-bold text-white">
                1,420
              </div>
              <div className="mt-2 text-[11px] font-mono text-slate-400">
                SafeSearch &amp; Parental Controls
              </div>
            </div>
          </div>

          {/* Top Clients & Upstream Latency */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Clients */}
            <div className="glass-panel rounded-xl border border-[#00f0ff]/20 bg-[#0b111a]/80 p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#00f0ff]" />
                  <h3 className="text-xs font-mono font-bold text-white uppercase">
                    Thiết Bị Gửi Truy Vấn Nhiều Nhất (Top Clients)
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Xếp theo số request</span>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-[#06090e] text-slate-400 text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3">Thiết Bị / IP</th>
                      <th className="py-2 px-3">Số Request</th>
                      <th className="py-2 px-3">Tỷ Lệ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    <tr>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-white">192.168.1.150</div>
                        <div className="text-[10px] text-slate-400">iPhone-15-Pro-Max</div>
                      </td>
                      <td className="py-2.5 px-3 text-[#00f0ff] font-bold">342,109</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="w-10">27.4%</span>
                          <div className="w-24 bg-slate-800 h-1.5 rounded overflow-hidden">
                            <div className="bg-[#00f0ff] h-full" style={{ width: '27.4%' }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-white">192.168.1.120</div>
                        <div className="text-[10px] text-slate-400">MacBook-Pro-M3</div>
                      </td>
                      <td className="py-2.5 px-3 text-[#00f0ff] font-bold">289,450</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="w-10">23.2%</span>
                          <div className="w-24 bg-slate-800 h-1.5 rounded overflow-hidden">
                            <div className="bg-[#00f0ff] h-full" style={{ width: '23.2%' }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-white">192.168.1.105</div>
                        <div className="text-[10px] text-slate-400">Samsung-Smart-TV (Living Room)</div>
                      </td>
                      <td className="py-2.5 px-3 text-[#00f0ff] font-bold">164,220</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="w-10">13.1%</span>
                          <div className="w-24 bg-slate-800 h-1.5 rounded overflow-hidden">
                            <div className="bg-[#00f0ff] h-full" style={{ width: '13.1%' }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-pink-400">192.168.1.188</div>
                        <div className="text-[10px] text-pink-300">iPad-Kids (Trẻ Em)</div>
                      </td>
                      <td className="py-2.5 px-3 text-amber-400 font-bold">98,400</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="w-10">7.9%</span>
                          <div className="w-24 bg-slate-800 h-1.5 rounded overflow-hidden">
                            <div className="bg-amber-400 h-full" style={{ width: '7.9%' }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-300">192.168.1.77</div>
                        <div className="text-[10px] text-slate-500">Smart-Home-Hub-IoT</div>
                      </td>
                      <td className="py-2.5 px-3 text-[#00f0ff] font-bold">54,300</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="w-10">4.3%</span>
                          <div className="w-24 bg-slate-800 h-1.5 rounded overflow-hidden">
                            <div className="bg-[#00f0ff] h-full" style={{ width: '4.3%' }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Upstream Latency */}
            <div className="glass-panel rounded-xl border border-[#00f0ff]/20 bg-[#0b111a]/80 p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#10b981]" />
                  <h3 className="text-xs font-mono font-bold text-white uppercase">
                    Độ Trễ Máy Chủ Upstream (Response Latency)
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-[#10b981] font-bold">TB: 11.8 ms</span>
              </div>

              <div className="mt-4 space-y-4 font-mono text-xs">
                <div className="bg-[#06090e] p-3 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white">https://dns.cloudflare.com/dns-query</span>
                    <span className="text-[#10b981] font-bold">7.2 ms</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden my-2">
                    <div className="bg-[#10b981] h-full" style={{ width: '58%' }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Xử lý 724,379 truy vấn (58%)</span>
                    <span className="text-[#10b981]">Phản hồi nhanh nhất (DoH)</span>
                  </div>
                </div>

                <div className="bg-[#06090e] p-3 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white">https://dns.google/dns-query</span>
                    <span className="text-[#00f0ff] font-bold">13.4 ms</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden my-2">
                    <div className="bg-[#00f0ff] h-full" style={{ width: '29%' }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Xử lý 362,189 truy vấn (29%)</span>
                    <span className="text-slate-400">Độ ổn định cao</span>
                  </div>
                </div>

                <div className="bg-[#06090e] p-3 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white">tls://dns.quad9.net</span>
                    <span className="text-amber-400 font-bold">19.1 ms</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden my-2">
                    <div className="bg-amber-400 h-full" style={{ width: '13%' }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Xử lý 162,362 truy vấn (13%)</span>
                    <span className="text-amber-400">Chuyên lọc Malware &amp; Threat</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Queried vs Top Blocked Domains */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
            <div className="glass-panel rounded-xl border border-[#00f0ff]/20 bg-[#0b111a]/80 p-5">
              <h3 className="text-xs font-bold text-white uppercase pb-3 border-b border-slate-800 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#00f0ff]" />
                Top Tên Miền Được Truy Vấn Nhiều Nhất
              </h3>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>1. gateway.icloud.com</span>
                    <span className="text-[#00f0ff]">89,420 (7.1%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                    <div className="bg-[#00f0ff] h-full" style={{ width: '71%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>2. connectivitycheck.gstatic.com</span>
                    <span className="text-[#00f0ff]">64,120 (5.1%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                    <div className="bg-[#00f0ff] h-full" style={{ width: '51%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>3. api.shopee.vn</span>
                    <span className="text-[#00f0ff]">41,200 (3.3%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                    <div className="bg-[#00f0ff] h-full" style={{ width: '33%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>4. graph.facebook.com</span>
                    <span className="text-[#00f0ff]">38,900 (3.1%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                    <div className="bg-[#00f0ff] h-full" style={{ width: '31%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>5. dns.google</span>
                    <span className="text-[#00f0ff]">29,100 (2.3%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                    <div className="bg-[#00f0ff] h-full" style={{ width: '23%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-xl border border-red-500/20 bg-[#0b111a]/80 p-5">
              <h3 className="text-xs font-bold text-white uppercase pb-3 border-b border-slate-800 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Top Tên Miền Bị Chặn Nhiều Nhất (24h)
              </h3>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>1. doubleclick.net (Google Ads)</span>
                    <span className="text-red-400">18,400 lần</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                    <div className="bg-red-500 h-full" style={{ width: '82%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>2. tracking.tiktok.com (TikTok Telemetry)</span>
                    <span className="text-red-400">12,850 lần</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                    <div className="bg-red-500 h-full" style={{ width: '58%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>3. analytics.google.com</span>
                    <span className="text-amber-400">9,410 lần</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                    <div className="bg-amber-400 h-full" style={{ width: '42%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>4. vortex.data.microsoft.com</span>
                    <span className="text-amber-400">8,200 lần</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                    <div className="bg-amber-400 h-full" style={{ width: '36%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>5. s.youtube.com (Ad Beacon)</span>
                    <span className="text-red-400">7,120 lần</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                    <div className="bg-red-500 h-full" style={{ width: '31%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBPAGE 2: BLOCKED SERVICES & SCHEDULE                   */}
      {/* ======================================================== */}
      {activeSubTab === 'services' && (
        <div className="space-y-6">
          {/* Schedule Pause Bar */}
          <div className="glass-panel rounded-xl border border-amber-500/30 bg-[#161106]/70 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⏰</span>
              <div>
                <div className="text-sm font-bold text-white">
                  Lịch Trình Tạm Dừng Chặn Dịch Vụ (Pause Schedule)
                </div>
                <div className="text-xs text-slate-400">
                  Tự động tạm mở các ứng dụng đã chặn trong khung giờ giải trí và tự siết chặt lại khi hết giờ.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-300">Từ:</span>
              <input
                type="time"
                value={scheduleFrom}
                onChange={(e) => setScheduleFrom(e.target.value)}
                className="bg-[#06090e] border border-slate-700 px-2 py-1 rounded text-white text-xs"
              />
              <span className="text-slate-300">Đến:</span>
              <input
                type="time"
                value={scheduleTo}
                onChange={(e) => setScheduleTo(e.target.value)}
                className="bg-[#06090e] border border-slate-700 px-2 py-1 rounded text-white text-xs"
              />
              <button
                onClick={() => setScheduleEnabled(!scheduleEnabled)}
                className={`px-3 py-1.5 rounded font-bold transition-all cursor-pointer border ${
                  scheduleEnabled
                    ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {scheduleEnabled ? 'ĐÃ BẬT' : 'ĐÃ TẮT'}
              </button>
            </div>
          </div>

          {/* Controls: Search & Category Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0b111a]/80 border border-slate-800 p-3 rounded-xl font-mono text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm nhanh trong 139 dịch vụ (ví dụ: Roblox, TikTok, Steam, ChatGPT...)"
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#06090e] border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-[#00f0ff]"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400">
                Đang chặn:{' '}
                <strong className="text-red-400">
                  {Object.values(appStates).filter(Boolean).length} / {Object.keys(appStates).length}
                </strong>
              </span>
              <button
                onClick={() => {
                  const updated: Record<string, boolean> = {};
                  Object.keys(appStates).forEach((k) => (updated[k] = false));
                  setAppStates(updated);
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] cursor-pointer"
              >
                Mở Tất Cả
              </button>
            </div>
          </div>

          {/* Categories Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                categoryFilter === 'ALL'
                  ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 font-bold'
                  : 'bg-[#06090e] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Tất cả (12 nhóm)
            </button>
            {serviceCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 font-bold'
                    : 'bg-[#06090e] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Categories Grid (Rendering all 12 categories or filtered) */}
          <div className="space-y-5 font-mono text-xs">
            {serviceCategories
              .filter((cat) => categoryFilter === 'ALL' || categoryFilter === cat.id)
              .map((cat) => {
                const Icon = cat.icon;
                const filteredServices = cat.services.filter((s) =>
                  s.toLowerCase().includes(serviceSearch.toLowerCase())
                );

                if (serviceSearch && filteredServices.length === 0) return null;

                const blockedCount = cat.services.filter((s) => appStates[s]).length;

                return (
                  <div
                    key={cat.id}
                    className="glass-panel rounded-xl border border-slate-800 bg-[#0b111a]/80 p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 mb-3 gap-2">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <Icon className="w-4 h-4 text-[#00f0ff]" />
                        <span className="text-sm">{cat.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-normal">
                          {blockedCount}/{cat.services.length} Đang Chặn
                        </span>
                      </div>

                      {cat.hasBulk && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleCategory(cat.services, true)}
                            className="px-2.5 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 rounded text-[10px] font-bold cursor-pointer"
                          >
                            Block all
                          </button>
                          <button
                            onClick={() => toggleCategory(cat.services, false)}
                            className="px-2.5 py-1 bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 rounded text-[10px] cursor-pointer"
                          >
                            Unblock all
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                      {filteredServices.map((app) => {
                        const isBlocked = !!appStates[app];
                        return (
                          <div
                            key={app}
                            onClick={() => toggleApp(app)}
                            className={`p-2.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                              isBlocked
                                ? 'border-red-500/50 bg-red-950/20 text-red-300'
                                : 'border-slate-800 bg-[#06090e] text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <div className="font-bold text-xs text-white truncate" title={app}>
                              {app}
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[10px]">
                              <span className={isBlocked ? 'text-red-400 font-bold' : 'text-[#10b981]'}>
                                {isBlocked ? 'BLOCKED' : 'ALLOWED'}
                              </span>
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isBlocked ? 'bg-red-500 shadow-[0_0_6px_#ef4444]' : 'bg-[#10b981]'
                                }`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBPAGE 3: FILTERS, BLOCKLISTS & DIAGNOSTIC              */}
      {/* ======================================================== */}
      {activeSubTab === 'filters' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Blocklists Table */}
          <div className="glass-panel rounded-xl border border-[#00f0ff]/20 bg-[#0b111a]/80 p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#00f0ff]" />
                  DANH SÁCH BỘ LỌC CHẶN DNS (DNS BLOCKLISTS)
                </h3>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Tự động đồng bộ các danh sách lọc quảng cáo, malware và bảo vệ người dùng
                </p>
              </div>
              <button
                onClick={() => alert('[Demo Mode] Đang kiểm tra cập nhật các bộ lọc...')}
                className="px-3 py-1.5 bg-[#00f0ff]/15 hover:bg-[#00f0ff]/25 text-[#00f0ff] border border-[#00f0ff]/40 rounded text-xs font-bold cursor-pointer"
              >
                🔄 KIỂM TRA CẬP NHẬT
              </button>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#06090e] text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Tên Bộ Lọc</th>
                    <th className="py-2.5 px-3">Nguồn URL</th>
                    <th className="py-2.5 px-3">Số Quy Tắc</th>
                    <th className="py-2.5 px-3">Cập Nhật</th>
                    <th className="py-2.5 px-3 text-right">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {blocklists.map((bl) => (
                    <tr key={bl.id} className="hover:bg-[#0f1724]/60">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{bl.name}</div>
                        <div className="text-[10px] text-slate-400">{bl.desc}</div>
                      </td>
                      <td className="py-3 px-3 text-[#00f0ff] text-[11px] max-w-xs truncate">
                        {bl.url}
                      </td>
                      <td className="py-3 px-3 text-[#10b981] font-bold">{bl.rules}</td>
                      <td className="py-3 px-3 text-slate-400">{bl.updated}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 rounded bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 text-[10px] font-bold">
                          HOẠT ĐỘNG
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Diagnostic Tool & Custom Rules */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Interactive Domain Check Diagnostic */}
            <div className="glass-panel rounded-xl border border-[#00f0ff]/30 bg-[#0b111a]/80 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                    <Search className="w-4 h-4 text-[#00f0ff]" />
                    Công Cụ Kiểm Tra Bộ Lọc (Check the Filtering)
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 text-[10px]">
                    REALTIME TEST
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] my-3">
                  Nhập bất kỳ tên miền nào để kiểm tra trực tiếp xem có bị Aegis-DNS chặn hay không và lý do cụ thể.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={diagDomain}
                    onChange={(e) => setDiagDomain(e.target.value)}
                    placeholder="Ví dụ: tiktok.com, scam-bank.vn, google.com"
                    className="flex-1 bg-[#06090e] border border-slate-700 px-3 py-2 rounded text-white text-xs focus:outline-none focus:border-[#00f0ff]"
                  />
                  <button
                    onClick={runDomainCheck}
                    className="px-4 py-2 bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-[#06090e] font-bold rounded cursor-pointer"
                  >
                    Kiểm Tra
                  </button>
                </div>

                {diagResult.tested && (
                  <div
                    className={`mt-4 p-4 rounded-lg border flex items-center justify-between ${
                      diagResult.blocked
                        ? 'bg-red-950/20 border-red-500/40 text-red-300'
                        : 'bg-[#10b981]/15 border-[#10b981]/40 text-[#10b981]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm flex items-center gap-2">
                        {diagResult.blocked ? '🔴 BỊ CHẶN BỞI BỘ LỌC' : '🟢 CHO PHÉP TRUY CẬP'}
                      </div>
                      <div className="text-[11px] text-slate-300 mt-1">{diagResult.reason}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Quy tắc: <code className="text-white bg-black/40 px-1 py-0.5 rounded">{diagResult.rule}</code>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400">
                Thử nghiệm tên miền: <span className="text-[#00f0ff] cursor-pointer" onClick={() => setDiagDomain('tiktok.com')}>tiktok.com</span>, <span className="text-[#00f0ff] cursor-pointer" onClick={() => setDiagDomain('scam-bank.vn')}>scam-bank.vn</span>, <span className="text-[#00f0ff] cursor-pointer" onClick={() => setDiagDomain('google.com')}>google.com</span>
              </div>
            </div>

            {/* Custom Rules */}
            <div className="glass-panel rounded-xl border border-slate-800 bg-[#0b111a]/80 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#10b981]" />
                    Quy Tắc Lọc Tùy Biến (Custom Filtering Rules)
                  </h3>
                  <button
                    onClick={() => alert('[Demo Mode] Đã lưu các quy tắc lọc tùy biến!')}
                    className="px-2.5 py-1 bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#10b981] border border-[#10b981]/40 rounded text-[11px] font-bold cursor-pointer"
                  >
                    💾 LƯU QUY TẮC
                  </button>
                </div>
                <p className="text-slate-400 text-[11px] my-2">
                  Hỗ trợ cú pháp chuẩn Adblock (<code>||example.com^</code>, <code>@@||allow.com^</code>, hoặc Regex).
                </p>
                <textarea
                  value={customRules}
                  onChange={(e) => setCustomRules(e.target.value)}
                  rows={6}
                  className="w-full bg-[#06090e] border border-slate-700 rounded p-3 text-white text-xs font-mono focus:outline-none focus:border-[#00f0ff] leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBPAGE 4: DNS REWRITES & CACHE                          */}
      {/* ======================================================== */}
      {activeSubTab === 'rewrites' && (
        <div className="space-y-6 font-mono text-xs">
          {/* DNS Rewrites Table */}
          <div className="glass-panel rounded-xl border border-[#00f0ff]/20 bg-[#0b111a]/80 p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#00f0ff]" />
                  ÁNH XẠ TÊN MIỀN CỤC BỘ (DNS REWRITES: *.AEGIS.LOCAL)
                </h3>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Ánh xạ trực tiếp tên miền sang IP nội bộ LAN mà không cần cấu hình file hosts trên máy trạm
                </p>
              </div>
              <button
                onClick={() => alert('[Demo Mode] Mở hộp thoại thêm DNS Rewrite mới')}
                className="px-3 py-1.5 bg-[#00f0ff]/15 hover:bg-[#00f0ff]/25 text-[#00f0ff] border border-[#00f0ff]/40 rounded text-xs font-bold cursor-pointer"
              >
                + THÊM REWRITE
              </button>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#06090e] text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Tên Miền (Domain)</th>
                    <th className="py-2.5 px-3">Kiểu Bản Ghi</th>
                    <th className="py-2.5 px-3">Địa Chỉ Phản Hồi</th>
                    <th className="py-2.5 px-3">Mô Tả Dịch Vụ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  <tr>
                    <td className="py-3 px-3 font-bold text-[#00f0ff]">*.aegis.local</td>
                    <td className="py-3 px-3 text-slate-400">A Record</td>
                    <td className="py-3 px-3 text-[#10b981] font-bold">10.0.0.1</td>
                    <td className="py-3 px-3 text-slate-300">Aegis Security Gateway &amp; Web UI</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-[#00f0ff]">nas.home.lan</td>
                    <td className="py-3 px-3 text-slate-400">A Record</td>
                    <td className="py-3 px-3 text-[#10b981] font-bold">192.168.1.100</td>
                    <td className="py-3 px-3 text-slate-300">Synology DiskStation NAS Server</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-[#00f0ff]">proxmox.lan</td>
                    <td className="py-3 px-3 text-slate-400">A Record</td>
                    <td className="py-3 px-3 text-[#10b981] font-bold">192.168.1.5</td>
                    <td className="py-3 px-3 text-slate-300">Proxmox VE Cluster Node</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-[#00f0ff]">router.internal</td>
                    <td className="py-3 px-3 text-slate-400">A Record</td>
                    <td className="py-3 px-3 text-[#10b981] font-bold">192.168.1.1</td>
                    <td className="py-3 px-3 text-slate-300">Core Gateway Router</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Cache Settings & Access */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel rounded-xl border border-slate-800 bg-[#0b111a]/80 p-5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase pb-2 border-b border-slate-800">
                ⚡ Cấu Hình Bộ Nhớ Đệm DNS (DNS Cache Settings)
              </h3>
              <div>
                <label className="text-slate-400 block mb-1">Kích thước Cache (RAM):</label>
                <input
                  type="text"
                  value={cacheSize}
                  onChange={(e) => setCacheSize(e.target.value)}
                  className="bg-[#06090e] border border-slate-700 px-3 py-1.5 rounded text-white w-40"
                />
                <span className="text-[10px] text-slate-500 ml-2">(~250,000 bản ghi)</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1">TTL Tối Thiểu (Min TTL):</label>
                  <input
                    type="number"
                    value={minTtl}
                    onChange={(e) => setMinTtl(Number(e.target.value))}
                    className="w-full bg-[#06090e] border border-slate-700 px-3 py-1.5 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">TTL Tối Đa (Max TTL):</label>
                  <input
                    type="number"
                    value={maxTtl}
                    onChange={(e) => setMaxTtl(Number(e.target.value))}
                    className="w-full bg-[#06090e] border border-slate-700 px-3 py-1.5 rounded text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#06090e] rounded border border-slate-800">
                <div>
                  <div className="font-bold text-white text-xs">Bộ Nhớ Đệm Lạc Quan (Optimistic Caching)</div>
                  <div className="text-[10px] text-slate-400">Trả về kết quả 0ms và cập nhật ngầm</div>
                </div>
                <button
                  onClick={() => setOptimisticCache(!optimisticCache)}
                  className={`px-3 py-1 rounded text-xs font-bold ${
                    optimisticCache ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {optimisticCache ? 'BẬT' : 'TẮT'}
                </button>
              </div>
            </div>

            <div className="glass-panel rounded-xl border border-slate-800 bg-[#0b111a]/80 p-5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase pb-2 border-b border-slate-800">
                🔒 Kiểm Soát Quyền Truy Cập (Access Settings)
              </h3>
              <div>
                <label className="text-slate-400 block mb-1">Allowed Clients (Chỉ cho phép các mạng IP này):</label>
                <textarea
                  defaultValue={`192.168.1.0/24\n10.0.0.0/24\n127.0.0.1`}
                  rows={3}
                  className="w-full bg-[#06090e] border border-slate-700 rounded p-2 text-white text-xs font-mono"
                />
              </div>
              <button
                onClick={() => alert('[Demo Mode] Đã lưu Access Settings!')}
                className="px-3 py-1.5 bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 rounded font-bold cursor-pointer"
              >
                💾 LƯU PHÂN QUYỀN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBPAGE 5: DNS ENGINE & UPSTREAM SERVERS                 */}
      {/* ======================================================== */}
      {activeSubTab === 'engine' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Upstream Servers Card */}
          <div className="glass-panel rounded-xl border border-[#00f0ff]/20 bg-[#0b111a]/80 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#00f0ff]" />
                Máy Chủ Upstream DNS (Upstream DNS Servers)
              </h3>
              <button
                onClick={() => alert('[Demo Mode] Kiểm tra kết nối upstream: Tất cả upstreams phản hồi dưới 15ms!')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[11px] cursor-pointer"
              >
                ⚡ TEST UPSTREAMS
              </button>
            </div>

            <div className="mt-3">
              <label className="text-slate-400 block mb-1">
                Danh sách Upstream (Hỗ trợ DoH, DoT, DoQ, IP):
              </label>
              <textarea
                value={upstreams}
                onChange={(e) => setUpstreams(e.target.value)}
                rows={4}
                className="w-full bg-[#06090e] border border-slate-700 rounded p-3 text-white text-xs font-mono leading-relaxed focus:outline-none focus:border-[#00f0ff]"
              />
            </div>

            {/* Mode selection */}
            <div className="mt-4 p-3 bg-[#06090e] rounded border border-slate-800">
              <div className="font-bold text-white mb-2">Chế Độ Truy Vấn Upstream (Upstream Mode):</div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="radio"
                    name="upmode"
                    checked={upstreamMode === 'parallel'}
                    onChange={() => setUpstreamMode('parallel')}
                  />
                  <span>
                    <strong className="text-white">Truy vấn song song (Parallel requests)</strong> — Gửi đồng thời tới tất cả upstreams và lấy phản hồi nhanh nhất (Khuyên dùng)
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="radio"
                    name="upmode"
                    checked={upstreamMode === 'loadbalance'}
                    onChange={() => setUpstreamMode('loadbalance')}
                  />
                  <span>
                    <strong className="text-white">Cân bằng tải (Load-balancing)</strong> — Phân phối xoay vòng
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="radio"
                    name="upmode"
                    checked={upstreamMode === 'fastest'}
                    onChange={() => setUpstreamMode('fastest')}
                  />
                  <span>
                    <strong className="text-white">IP Nhanh nhất (Fastest IP)</strong> — Truy vấn và ping lấy IP có độ trễ thấp nhất
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => alert('[Demo Mode] Đã lưu cấu hình máy chủ Upstream!')}
                className="px-4 py-2 bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-[#06090e] font-bold rounded cursor-pointer"
              >
                💾 LƯU CẤU HÌNH UPSTREAM
              </button>
            </div>
          </div>

          {/* Engine Settings & Encryption */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel rounded-xl border border-slate-800 bg-[#0b111a]/80 p-5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase pb-2 border-b border-slate-800">
                ⚙️ Thiết Lập Động Cơ &amp; Chế Độ Chặn
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1">Giới Hạn Tốc Độ (RPS):</label>
                  <input
                    type="number"
                    value={rateLimit}
                    onChange={(e) => setRateLimit(Number(e.target.value))}
                    className="w-full bg-[#06090e] border border-slate-700 px-3 py-1.5 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Chế Độ Chặn Trả Về:</label>
                  <select
                    value={blockingMode}
                    onChange={(e) => setBlockingMode(e.target.value)}
                    className="w-full bg-[#06090e] border border-slate-700 px-2 py-1.5 rounded text-white"
                  >
                    <option value="default">Default IP (0.0.0.0)</option>
                    <option value="nxdomain">NXDOMAIN</option>
                    <option value="refused">REFUSED</option>
                    <option value="custom">Custom IP (10.0.0.1)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Bật DNSSEC Extensions</div>
                    <div className="text-[10px] text-slate-400">Xác thực chữ ký số chống đầu độc cache</div>
                  </div>
                  <button
                    onClick={() => setDnssecEnabled(!dnssecEnabled)}
                    className={`px-3 py-1 rounded font-bold ${
                      dnssecEnabled ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {dnssecEnabled ? 'BẬT' : 'TẮT'}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Vô Hiệu Hóa Phân Giải IPv6 (AAAA)</div>
                    <div className="text-[10px] text-slate-400">Tối ưu tốc độ khi chỉ sử dụng IPv4</div>
                  </div>
                  <button
                    onClick={() => setDisableIpv6(!disableIpv6)}
                    className={`px-3 py-1 rounded font-bold ${
                      disableIpv6 ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {disableIpv6 ? 'BẬT' : 'TẮT'}
                  </button>
                </div>
              </div>
            </div>

            {/* DNS Encryption */}
            <div className="glass-panel rounded-xl border border-slate-800 bg-[#0b111a]/80 p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#00f0ff]" />
                  Mã Hóa Máy Chủ (DNS Encryption Server)
                </h3>
                <span className="px-2 py-0.5 rounded bg-[#10b981]/20 text-[#10b981] text-[10px] font-bold">
                  READY
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Bật DoH &amp; DoT Server</div>
                  <div className="text-[10px] text-slate-400">Mã hóa truy vấn an toàn cho máy trạm</div>
                </div>
                <button
                  onClick={() => setEncryptionEnabled(!encryptionEnabled)}
                  className={`px-3 py-1 rounded font-bold ${
                    encryptionEnabled ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {encryptionEnabled ? 'BẬT' : 'TẮT'}
                </button>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Tên Miền Máy Chủ (Server SNI):</label>
                <input
                  type="text"
                  defaultValue="dns.aegis.local"
                  className="w-full bg-[#06090e] border border-slate-700 px-3 py-1.5 rounded text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1">Cổng HTTPS (DoH):</label>
                  <input
                    type="number"
                    defaultValue={443}
                    className="w-full bg-[#06090e] border border-slate-700 px-3 py-1.5 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Cổng DoT / DoQ:</label>
                  <input
                    type="number"
                    defaultValue={853}
                    className="w-full bg-[#06090e] border border-slate-700 px-3 py-1.5 rounded text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#06090e] rounded border border-slate-800 text-[11px] text-slate-400">
                <span className="text-[#00f0ff] font-bold block">Chứng chỉ SSL Nội Bộ:</span>
                Aegis Internal Root CA (Valid đến: 2027-10-13)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBPAGE 6: LIVE QUERY LOG EXPLORER                       */}
      {/* ======================================================== */}
      {activeSubTab === 'logs' && (
        <div className="glass-panel rounded-xl border border-[#00f0ff]/20 bg-[#0b111a]/80 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                NHẬT KÝ TRUY VẤN THỜI GIAN THỰC (LIVE QUERY LOG)
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Luồng truy vấn DNS streaming trực tiếp qua Socket
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm domain / IP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-[#06090e] border border-slate-700 rounded text-xs font-mono text-white focus:outline-none focus:border-[#00f0ff] w-48"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#06090e] border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-[#00f0ff]"
              >
                <option value="ALL">Tất cả truy vấn</option>
                <option value="BLOCKED">Chỉ xem Bị Chặn</option>
                <option value="RESOLVED">Chỉ xem Thành Công</option>
                <option value="REWRITTEN">Chỉ xem Ánh Xạ</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#06090e] text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Thời Gian</th>
                  <th className="py-2.5 px-3">Tên Miền Yêu Cầu</th>
                  <th className="py-2.5 px-3">Máy Trạm (Client)</th>
                  <th className="py-2.5 px-3">Kiểu</th>
                  <th className="py-2.5 px-3">Trạng Thái Xử Lý</th>
                  <th className="py-2.5 px-3 text-right">Độ Trễ</th>
                  <th className="py-2.5 px-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#0f1724]/60 transition-colors">
                    <td className="py-3 px-3 text-slate-400">{log.time}</td>
                    <td className="py-3 px-3 font-bold text-white">{log.domain}</td>
                    <td className="py-3 px-3">
                      <span className="text-slate-300">{log.clientName}</span>{' '}
                      <span className="text-slate-500">({log.clientIp})</span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{log.type}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          log.status === 'BLOCKED'
                            ? 'bg-red-500/20 text-red-400 border-red-500/40'
                            : log.status === 'REWRITTEN'
                            ? 'bg-[#8b5cf6]/20 text-[#8b5cf6] border-[#8b5cf6]/40'
                            : 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/40'
                        }`}
                      >
                        {log.status === 'BLOCKED'
                          ? '🔴 BLOCKED'
                          : log.status === 'REWRITTEN'
                          ? '🔄 REWRITTEN'
                          : '🟢 PROCESSED'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">{log.responseTime}</td>
                    <td className="py-3 px-3 text-right">
                      {log.status === 'BLOCKED' ? (
                        <button
                          onClick={() => alert(`[Demo Mode] Cho phép tạm thời tên miền ${log.domain}`)}
                          className="px-2 py-0.5 rounded bg-[#10b981]/15 hover:bg-[#10b981]/30 text-[#10b981] border border-[#10b981]/30 text-[10px] cursor-pointer"
                        >
                          Mở Chặn
                        </button>
                      ) : (
                        <button
                          onClick={() => alert(`[Demo Mode] Đã thêm quy tắc chặn tên miền ${log.domain}`)}
                          className="px-2 py-0.5 rounded bg-red-500/15 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-[10px] cursor-pointer"
                        >
                          Chặn
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

import {
  FirewallModule,
  AutoBanEntry,
  CidrRule,
  NetworkPort,
  DhcpLease,
  NatRule,
  PppoeProfile,
  FirewallConnection,
  DnsStats,
  BlockedService,
  DnsQueryLog,
  DnsRewrite,
  SpeedtestServer,
  NetflowSession,
  BackupItem,
  AuditLog
} from '../types';

export const INITIAL_FIREWALL_MODULES: FirewallModule[] = [
  {
    id: 'syn_flood',
    name: 'TCP SYN Flood Guard',
    description: 'XDP SYN-Cookie hardware offload & early drop invalid TCP flags',
    mode: 'DROP',
    status: 'STANDBY',
    drops: 0,
    pps: 0,
    latency: '0.00 ms',
    category: 'L3/L4'
  },
  {
    id: 'udp_flood',
    name: 'UDP Flood & Amplification',
    description: 'Rate-limits arbitrary UDP datagrams & drops unrequested ports',
    mode: 'DROP',
    status: 'STANDBY',
    drops: 0,
    pps: 0,
    latency: '0.00 ms',
    category: 'L3/L4'
  },
  {
    id: 'icmp_flood',
    name: 'ICMP Smurf / Ping Throttle',
    description: 'Enforces strict token-bucket ICMP echo limits (< 50 pps/src)',
    mode: 'DROP',
    status: 'STANDBY',
    drops: 0,
    pps: 0,
    latency: '0.00 ms',
    category: 'Protocol'
  },
  {
    id: 'dns_amp',
    name: 'DNS ANY Reflection Guard',
    description: 'Blocks inbound spoofed UDP 53 ANY queries & large EDNS0 responses',
    mode: 'DROP',
    status: 'STANDBY',
    drops: 0,
    pps: 0,
    latency: '0.00 ms',
    category: 'Protocol'
  },
  {
    id: 'ntp_amp',
    name: 'NTP Monlist Shield',
    description: 'Inspects UDP 123 payloads for Mode 7 Monlist request vectors',
    mode: 'DROP',
    status: 'STANDBY',
    drops: 0,
    pps: 0,
    latency: '0.00 ms',
    category: 'Protocol'
  },
  {
    id: 'ssdp_amp',
    name: 'SSDP / UPnP Amplification',
    description: 'Silently swallows UDP 1900 M-SEARCH reflection probes at ingress',
    mode: 'DROP',
    status: 'STANDBY',
    drops: 0,
    pps: 0,
    latency: '0.00 ms',
    category: 'Protocol'
  },
  {
    id: 'snmp_amp',
    name: 'SNMP Reflection Filter',
    description: 'Blocks unauthorized UDP 161/162 public community string queries',
    mode: 'DROP',
    status: 'STANDBY',
    drops: 0,
    pps: 0,
    latency: '0.00 ms',
    category: 'Protocol'
  },
  {
    id: 'charon_ipsec',
    name: 'IPSec IKE Handshake Guard',
    description: 'Mitigates pseudo-IKE phase 1 SA initiation flood on UDP 500/4500',
    mode: 'MONITOR',
    status: 'STANDBY',
    drops: 0,
    pps: 0,
    latency: '0.00 ms',
    category: 'Protocol'
  },
  {
    id: 'http_slowloris',
    name: 'Slowloris / Slow POST Defense',
    description: 'Tracks header completion timeouts & purges lingering TCP sockets',
    mode: 'DROP',
    status: 'STANDBY',
    drops: 0,
    pps: 0,
    latency: '0.00 ms',
    category: 'Application'
  },
  {
    id: 'tls_reneg',
    name: 'TLS Renegotiation Exhaustion',
    description: 'Limits client-initiated SSL handshakes per TCP session',
    mode: 'DROP',
    status: 'STANDBY',
    drops: 0,
    pps: 0,
    latency: '0.00 ms',
    category: 'Application'
  },
  {
    id: 'ip_frag',
    name: 'IP Fragment Overlap Defense',
    description: 'Prevents fragment reassembly memory exhaustion (Bonk/Jolt2)',
    mode: 'DROP',
    status: 'STANDBY',
    drops: 0,
    pps: 0,
    latency: '0.00 ms',
    category: 'L3/L4'
  },
  {
    id: 'land_attack',
    name: 'LAND Attack Filter',
    description: 'Instant drop for packets where Source IP equals Destination IP',
    mode: 'DROP',
    status: 'STANDBY',
    drops: 0,
    pps: 0,
    latency: '0.00 ms',
    category: 'L3/L4'
  },
  {
    id: 'teardrop',
    name: 'Teardrop Malformed Offset',
    description: 'Validates overlapping fragment length math inside eBPF parser',
    mode: 'DROP',
    status: 'STANDBY',
    drops: 0,
    pps: 0,
    latency: '0.00 ms',
    category: 'L3/L4'
  },
  {
    id: 'smurf_attack',
    name: 'Smurf / Broadcast Reflection',
    description: 'Rejects traffic addressed to subnet broadcast IPs via external WAN',
    mode: 'DROP',
    status: 'STANDBY',
    drops: 0,
    pps: 0,
    latency: '0.00 ms',
    category: 'Protocol'
  },
  {
    id: 'botnet_c2',
    name: 'Mirai / Dark-IoT Botnet Shield',
    description: 'BFF feeds threat intelligence list directly to eBPF hashmap',
    mode: 'DROP',
    status: 'STANDBY',
    drops: 0,
    pps: 0,
    latency: '0.00 ms',
    category: 'Stateful'
  },
  {
    id: 'geoip_filter',
    name: 'GeoIP High-Risk ASN Drop',
    description: 'Drops inbound connections originating from sanctioned/bulletproof ASNs',
    mode: 'DROP',
    status: 'STANDBY',
    drops: 0,
    pps: 0,
    latency: '0.00 ms',
    category: 'Stateful'
  }
];

export const INITIAL_AUTOBAN_LIST: AutoBanEntry[] = [];

export const INITIAL_CIDR_RULES: CidrRule[] = [];

export const NETWORK_PORTS: NetworkPort[] = [
  { id: 1, name: 'ether1', label: 'WAN-FPT', status: 'DOWN', speed: '1 Gbps', duplex: 'Full', vlan: 7, rx: '0 bps', tx: '0 bps', type: 'WAN' },
  { id: 2, name: 'ether2', label: 'LAN-Main', status: 'DOWN', speed: '1 Gbps', duplex: 'Full', vlan: 1, rx: '0 bps', tx: '0 bps', type: 'LAN' },
  { id: 3, name: 'ether3', label: 'DMZ-Core', status: 'DOWN', speed: '1 Gbps', duplex: 'Full', vlan: 100, rx: '0 bps', tx: '0 bps', type: 'LAN' },
  { id: 4, name: 'ether4', label: 'WAN-Viettel', status: 'DOWN', speed: '1 Gbps', duplex: 'Full', vlan: 35, rx: '0 bps', tx: '0 bps', type: 'WAN' },
  { id: 5, name: 'ether5', label: 'Trunk-AP', status: 'DOWN', speed: '1 Gbps', duplex: 'Full', vlan: 10, rx: '0 bps', tx: '0 bps', type: 'LAN' },
  { id: 6, name: 'ether6', label: 'VoIP-Phone', status: 'DOWN', speed: '100 Mbps', duplex: 'Full', vlan: 20, rx: '0 bps', tx: '0 bps', type: 'LAN' },
  { id: 7, name: 'ether7', label: 'CCTV-NVR', status: 'DOWN', speed: '1 Gbps', duplex: 'Full', vlan: 30, rx: '0 bps', tx: '0 bps', type: 'LAN' },
  { id: 8, name: 'ether8', label: 'Isolated-Lab', status: 'DOWN', speed: 'N/A', duplex: 'None', vlan: 99, rx: '0 bps', tx: '0 bps', type: 'LAN' },
  { id: 9, name: 'sfp-plus1', label: 'SFP+ 10G Uplink', status: 'DOWN', speed: '10 Gbps', duplex: 'Full', vlan: 1, rx: '0 bps', tx: '0 bps', type: 'SFP' },
  { id: 10, name: 'mgmt', label: 'Out-of-Band', status: 'UP', speed: '100 Mbps', duplex: 'Full', vlan: 999, ip: '10.254.254.1', rx: '0 bps', tx: '0 bps', type: 'MGMT' }
];

export const INITIAL_DHCP_LEASES: DhcpLease[] = [];

export const INITIAL_NAT_RULES: NatRule[] = [];

export const INITIAL_FIREWALL_CONNECTIONS: FirewallConnection[] = [];

export const ISP_PRESETS: PppoeProfile[] = [
  {
    id: 'fpt',
    name: 'FPT Telecom FTTH GPON',
    badge: 'FPT Telecom',
    vlanId: 7,
    iface: 'ether1',
    username: '',
    password: '',
    mtu: 1492,
    distance: 1,
    recommendation: 'VLAN 7 chuẩn hóa GPON Bridge. MTU 1492. Hỗ trợ IPv6 Prefix Delegation /56.',
    status: 'DISCONNECTED',
    uptime: '0s',
    ipAddress: '',
    gateway: '',
    usePeerDns: false,
    addDefaultRoute: true,
  },
  {
    id: 'viettel',
    name: 'Viettel Telecom GPON',
    badge: 'Viettel Telecom',
    vlanId: 35,
    iface: 'ether4',
    username: '',
    password: '',
    mtu: 1492,
    distance: 2,
    recommendation: 'VLAN 35 trên modem DASAN/ZTE/Huawei Bridge. Keepalive 10s tự động failover.',
    status: 'DISCONNECTED',
    uptime: '0s',
    ipAddress: '',
    gateway: '',
    usePeerDns: false,
    addDefaultRoute: true,
  },
  {
    id: 'vnpt',
    name: 'VNPT Vinaphone FiberVNN',
    badge: 'VNPT Vinaphone',
    vlanId: 32,
    iface: 'ether1',
    username: '',
    password: '',
    mtu: 1492,
    distance: 3,
    recommendation: 'VLAN 32 chuẩn hóa mạng VNPT miền Bắc (hoặc VLAN 11). Tối ưu định tuyến cáp biển APG/AAG.',
    status: 'DISCONNECTED',
    uptime: '0s',
    ipAddress: '',
    gateway: '',
    usePeerDns: false,
    addDefaultRoute: false,
  }
];

export const DNS_STATS: DnsStats = {
  queriesTotal: 0,
  blockedTotal: 0,
  blockedPercent: 0,
  avgLatencyMs: 0,
  rulesCount: 0
};

export const INITIAL_BLOCKED_SERVICES: BlockedService[] = [
  { id: 'minecraft', name: 'Minecraft Online', category: 'Gaming', icon: 'Gamepad2', blocked: false, count24h: 0 },
  { id: 'roblox', name: 'Roblox Platform', category: 'Gaming', icon: 'Gamepad', blocked: false, count24h: 0 },
  { id: 'gemini', name: 'Google Gemini AI', category: 'Artificial Intelligence', icon: 'Bot', blocked: false, count24h: 0 },
  { id: 'tiktok', name: 'TikTok & ByteDance', category: 'Social Media', icon: 'Share2', blocked: false, count24h: 0 },
  { id: 'facebook', name: 'Facebook & Instagram', category: 'Social Media', icon: 'Globe', blocked: false, count24h: 0 },
  { id: 'doh_bypass', name: 'Anti DoH/DoT Bypass', category: 'Security Enforce', icon: 'ShieldAlert', blocked: false, count24h: 0 },
  { id: 'torrent', name: 'BitTorrent & P2P Trackers', category: 'File Sharing', icon: 'DownloadCloud', blocked: false, count24h: 0 },
  { id: 'discord', name: 'Discord Chat & Voice', category: 'Communications', icon: 'MessageSquare', blocked: false, count24h: 0 },
  { id: 'steam', name: 'Steam Community & CDN', category: 'Gaming', icon: 'PlayCircle', blocked: false, count24h: 0 },
  { id: 'pornography', name: 'Adult & Explicit Content', category: 'Content Safety', icon: 'EyeOff', blocked: false, count24h: 0 },
  { id: 'tor', name: 'Tor Relay & Onion Exit', category: 'Anonymizer', icon: 'Key', blocked: false, count24h: 0 }
];

export const INITIAL_QUERY_LOG: DnsQueryLog[] = [];

export const DNS_REWRITES: DnsRewrite[] = [];

export const SPEEDTEST_SERVERS: SpeedtestServer[] = [
  {
    id: 'cf-vn',
    name: 'Cloudflare CDN PoP (Hà Nội, VN)',
    isp: 'Cloudflare / VNPT / Viettel Peering',
    location: 'Hanoi, Vietnam',
    ping: 0,
    type: 'cloudflare',
    endpoint: 'https://speed.cloudflare.com'
  },
  {
    id: 'cf-sin',
    name: 'Cloudflare CDN PoP (Singapore Colo)',
    isp: 'Cloudflare / Equinix SG1',
    location: 'Singapore',
    ping: 0,
    type: 'cloudflare',
    endpoint: 'https://speed.cloudflare.com'
  },
  {
    id: 'aegis-local',
    name: 'Aegis Local Host Gateway (LAN / RouterOS)',
    isp: 'Aegis Core Subsystem',
    location: 'Internal Network',
    ping: 0,
    type: 'local',
    endpoint: '/api/telemetry/speedtest'
  },
  {
    id: 'fpt-edge',
    name: 'FPT Telecom / Tier-1 Transit Edge',
    isp: 'FPT Telecom / Cloudflare Edge',
    location: 'Da Nang, Vietnam',
    ping: 0,
    type: 'cloudflare',
    endpoint: 'https://speed.cloudflare.com'
  }
];

export const NETFLOW_SESSIONS: NetflowSession[] = [];

export const BACKUP_ITEMS: BackupItem[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

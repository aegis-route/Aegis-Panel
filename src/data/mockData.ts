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
    status: 'ACTIVE',
    drops: 1420580,
    pps: 14200,
    latency: '0.04 ms',
    category: 'L3/L4'
  },
  {
    id: 'udp_flood',
    name: 'UDP Flood & Amplification',
    description: 'Rate-limits arbitrary UDP datagrams & drops unrequested ports',
    mode: 'DROP',
    status: 'ACTIVE',
    drops: 894120,
    pps: 8900,
    latency: '0.03 ms',
    category: 'L3/L4'
  },
  {
    id: 'icmp_flood',
    name: 'ICMP Smurf / Ping Throttle',
    description: 'Enforces strict token-bucket ICMP echo limits (< 50 pps/src)',
    mode: 'DROP',
    status: 'ACTIVE',
    drops: 42100,
    pps: 120,
    latency: '0.02 ms',
    category: 'Protocol'
  },
  {
    id: 'dns_amp',
    name: 'DNS ANY Reflection Guard',
    description: 'Blocks inbound spoofed UDP 53 ANY queries & large EDNS0 responses',
    mode: 'DROP',
    status: 'ACTIVE',
    drops: 512900,
    pps: 3400,
    latency: '0.05 ms',
    category: 'Protocol'
  },
  {
    id: 'ntp_amp',
    name: 'NTP Monlist Shield',
    description: 'Inspects UDP 123 payloads for Mode 7 Monlist request vectors',
    mode: 'DROP',
    status: 'ACTIVE',
    drops: 12450,
    pps: 0,
    latency: '0.03 ms',
    category: 'Protocol'
  },
  {
    id: 'ssdp_amp',
    name: 'SSDP / UPnP Amplification',
    description: 'Silently swallows UDP 1900 M-SEARCH reflection probes at ingress',
    mode: 'DROP',
    status: 'ACTIVE',
    drops: 38200,
    pps: 45,
    latency: '0.03 ms',
    category: 'Protocol'
  },
  {
    id: 'snmp_amp',
    name: 'SNMP Reflection Filter',
    description: 'Blocks unauthorized UDP 161/162 public community string queries',
    mode: 'DROP',
    status: 'ACTIVE',
    drops: 9810,
    pps: 0,
    latency: '0.03 ms',
    category: 'Protocol'
  },
  {
    id: 'charon_ipsec',
    name: 'IPSec IKE Handshake Guard',
    description: 'Mitigates pseudo-IKE phase 1 SA initiation flood on UDP 500/4500',
    mode: 'MONITOR',
    status: 'STANDBY',
    drops: 0,
    pps: 18,
    latency: '0.06 ms',
    category: 'Protocol'
  },
  {
    id: 'http_slowloris',
    name: 'Slowloris / Slow POST Defense',
    description: 'Tracks header completion timeouts & purges lingering TCP sockets',
    mode: 'DROP',
    status: 'ACTIVE',
    drops: 64100,
    pps: 820,
    latency: '0.08 ms',
    category: 'Application'
  },
  {
    id: 'tls_reneg',
    name: 'TLS Renegotiation Exhaustion',
    description: 'Limits client-initiated SSL handshakes per TCP session',
    mode: 'DROP',
    status: 'ACTIVE',
    drops: 18320,
    pps: 110,
    latency: '0.07 ms',
    category: 'Application'
  },
  {
    id: 'ip_frag',
    name: 'IP Fragment Overlap Defense',
    description: 'Prevents fragment reassembly memory exhaustion (Bonk/Jolt2)',
    mode: 'DROP',
    status: 'ACTIVE',
    drops: 15400,
    pps: 0,
    latency: '0.04 ms',
    category: 'L3/L4'
  },
  {
    id: 'land_attack',
    name: 'LAND Attack Filter',
    description: 'Instant drop for packets where Source IP equals Destination IP',
    mode: 'DROP',
    status: 'ACTIVE',
    drops: 2310,
    pps: 0,
    latency: '0.02 ms',
    category: 'L3/L4'
  },
  {
    id: 'teardrop',
    name: 'Teardrop Malformed Offset',
    description: 'Validates overlapping fragment length math inside eBPF parser',
    mode: 'DROP',
    status: 'ACTIVE',
    drops: 890,
    pps: 0,
    latency: '0.02 ms',
    category: 'L3/L4'
  },
  {
    id: 'smurf_attack',
    name: 'Smurf / Broadcast Reflection',
    description: 'Rejects traffic addressed to subnet broadcast IPs via external WAN',
    mode: 'DROP',
    status: 'ACTIVE',
    drops: 4120,
    pps: 0,
    latency: '0.02 ms',
    category: 'Protocol'
  },
  {
    id: 'botnet_c2',
    name: 'Mirai / Dark-IoT Botnet Shield',
    description: 'BFF feeds threat intelligence list directly to eBPF hashmap',
    mode: 'DROP',
    status: 'ACTIVE',
    drops: 245100,
    pps: 2150,
    latency: '0.05 ms',
    category: 'Stateful'
  },
  {
    id: 'geoip_filter',
    name: 'GeoIP High-Risk ASN Drop',
    description: 'Drops inbound connections originating from sanctioned/bulletproof ASNs',
    mode: 'DROP',
    status: 'ACTIVE',
    drops: 781200,
    pps: 4200,
    latency: '0.06 ms',
    category: 'Stateful'
  }
];

export const INITIAL_AUTOBAN_LIST: AutoBanEntry[] = [
  {
    id: 'ban-1',
    ip: '185.220.101.5',
    country: 'Germany',
    countryCode: 'DE',
    reason: 'SSH Brute Force (> 80 attempts/min)',
    bannedAt: '10:14:02',
    expires: '23h 48m',
    score: 98
  },
  {
    id: 'ban-2',
    ip: '45.154.255.88',
    country: 'Russia',
    countryCode: 'RU',
    reason: 'SYN Flood target port 443 (18,000 pps)',
    bannedAt: '10:02:18',
    expires: '23h 36m',
    score: 100
  },
  {
    id: 'ban-3',
    ip: '194.26.29.112',
    country: 'Netherlands',
    countryCode: 'NL',
    reason: 'DNS ANY query amplification probe',
    bannedAt: '09:45:51',
    expires: '23h 19m',
    score: 92
  },
  {
    id: 'ban-4',
    ip: '103.151.125.4',
    country: 'Vietnam',
    countryCode: 'VN',
    reason: 'Suspicious scan on MikroTik Winbox (8291)',
    bannedAt: '09:12:04',
    expires: '22h 46m',
    score: 85
  },
  {
    id: 'ban-5',
    ip: '91.240.118.234',
    country: 'Seychelles',
    countryCode: 'SC',
    reason: 'Mirai Botnet C2 Heartbeat Signature',
    bannedAt: '08:50:33',
    expires: '22h 24m',
    score: 99
  }
];

export const INITIAL_CIDR_RULES: CidrRule[] = [
  {
    id: 'cidr-1',
    cidr: '172.30.0.0/24',
    action: 'ALLOW',
    comment: 'PVE Management Hypervisor WAN Bridge (vmbr0)',
    hits: 2459102,
    added: '2026-10-01'
  },
  {
    id: 'cidr-2',
    cidr: '10.254.254.0/24',
    action: 'ALLOW',
    comment: 'Kernel Firewall <-> RouterOS Transit Subnet (vmbr1)',
    hits: 18940221,
    added: '2026-10-01'
  },
  {
    id: 'cidr-3',
    cidr: '10.10.100.0/24',
    action: 'ALLOW',
    comment: 'DMZ Core Services (AdGuard, Aegis-API, Auth)',
    hits: 12410884,
    added: '2026-10-01'
  },
  {
    id: 'cidr-4',
    cidr: '172.30.0.202/32',
    action: 'DROP',
    comment: 'Isolated Attacker Kali Linux VM 106 - Strict WAN Boundary',
    hits: 41829,
    added: '2026-10-15'
  }
];

export const NETWORK_PORTS: NetworkPort[] = [
  { id: 1, name: 'ether1', label: 'WAN-FPT', status: 'UP', speed: '1 Gbps', duplex: 'Full', vlan: 7, ip: '172.30.0.101', rx: '284 Mbps', tx: '14.2 Mbps', type: 'WAN' },
  { id: 2, name: 'ether2', label: 'LAN-Main', status: 'UP', speed: '1 Gbps', duplex: 'Full', vlan: 1, ip: '10.10.1.1/24', rx: '48.2 Mbps', tx: '189 Mbps', type: 'LAN' },
  { id: 3, name: 'ether3', label: 'DMZ-Core', status: 'UP', speed: '1 Gbps', duplex: 'Full', vlan: 100, ip: '10.10.100.1/24', rx: '12.5 Mbps', tx: '18.4 Mbps', type: 'LAN' },
  { id: 4, name: 'ether4', label: 'WAN-Viettel', status: 'UP', speed: '1 Gbps', duplex: 'Full', vlan: 35, ip: '172.30.0.102', rx: '0.4 Mbps', tx: '0.1 Mbps', type: 'WAN' },
  { id: 5, name: 'ether5', label: 'Trunk-AP', status: 'UP', speed: '1 Gbps', duplex: 'Full', vlan: 10, rx: '84.1 Mbps', tx: '72.3 Mbps', type: 'LAN' },
  { id: 6, name: 'ether6', label: 'VoIP-Phone', status: 'UP', speed: '100 Mbps', duplex: 'Full', vlan: 20, rx: '0.8 Mbps', tx: '0.8 Mbps', type: 'LAN' },
  { id: 7, name: 'ether7', label: 'CCTV-NVR', status: 'UP', speed: '1 Gbps', duplex: 'Full', vlan: 30, rx: '32.1 Mbps', tx: '0.2 Mbps', type: 'LAN' },
  { id: 8, name: 'ether8', label: 'Isolated-Lab', status: 'DOWN', speed: 'N/A', duplex: 'None', vlan: 99, rx: '0 bps', tx: '0 bps', type: 'LAN' },
  { id: 9, name: 'sfp-plus1', label: 'SFP+ 10G Uplink', status: 'UP', speed: '10 Gbps', duplex: 'Full', vlan: 1, rx: '1.2 Gbps', tx: '940 Mbps', type: 'SFP' },
  { id: 10, name: 'mgmt', label: 'Out-of-Band', status: 'UP', speed: '100 Mbps', duplex: 'Full', vlan: 999, ip: '10.254.254.1', rx: '12 Kbps', tx: '8 Kbps', type: 'MGMT' }
];

export const INITIAL_DHCP_LEASES: DhcpLease[] = [
  { id: 'lease-1', ip: '10.10.1.100', mac: 'BC:24:11:05:AA:11', hostname: 'ubuntu-desktop-105', status: 'bound', expires: '06h 42m', fastTrack: true },
  { id: 'lease-2', ip: '10.10.100.2', mac: 'BC:24:11:03:DD:02', hostname: 'aegis-dns-core-103', status: 'bound', expires: 'Static Bind', fastTrack: false },
  { id: 'lease-3', ip: '10.10.1.101', mac: 'BC:24:11:88:FF:99', hostname: 'noc-workstation-admin', status: 'bound', expires: '11h 14m', fastTrack: true },
  { id: 'lease-4', ip: '10.10.1.150', mac: '00:0B:82:76:E2:01', hostname: 'grandstream-pbx-gxp', status: 'bound', expires: '21h 05m', fastTrack: false },
  { id: 'lease-5', ip: '10.10.1.210', mac: 'AC:84:C6:54:12:88', hostname: 'unifi-ap-u6-pro', status: 'bound', expires: 'Static Bind', fastTrack: true }
];

export const INITIAL_NAT_RULES: NatRule[] = [
  { id: 0, chain: 'dstnat', proto: 'udp', inInterface: 'ether2-LAN', dstPort: '53', toAddress: '10.10.100.2', toPort: '53', comment: 'Force all LAN DNS (UDP) to AdGuard Home [Anti-Bypass]', packets: 841920, enabled: true },
  { id: 1, chain: 'dstnat', proto: 'tcp', inInterface: 'ether2-LAN', dstPort: '53', toAddress: '10.10.100.2', toPort: '53', comment: 'Force all LAN DNS (TCP) to AdGuard Home [Anti-Bypass]', packets: 12480, enabled: true },
  { id: 2, chain: 'dstnat', proto: 'tcp', inInterface: 'ether1-WAN', dstPort: '443', toAddress: '10.10.100.10', toPort: '443', comment: 'Ingress Aegis Cyber-NOC Web Panel Reverse Proxy', packets: 341090, enabled: true },
  { id: 3, chain: 'dstnat', proto: 'tcp', inInterface: 'ether1-WAN', dstPort: '3000', toAddress: '10.10.100.2', toPort: '3000', comment: 'Aegis Threat Intel REST API Daemon', packets: 42180, enabled: true },
  { id: 4, chain: 'dstnat', proto: 'udp', inInterface: 'ether1-WAN', dstPort: '51820', toAddress: '10.10.100.5', toPort: '51820', comment: 'Site-to-Site WireGuard Secure VPN Gateway', packets: 98120, enabled: true },
  { id: 5, chain: 'dstnat', proto: 'tcp', inInterface: 'ether1-WAN', dstPort: '8291', toAddress: '10.10.1.1', toPort: '8291', comment: 'RouterOS Remote Winbox Secure Management', packets: 1840, enabled: false }
];

export const INITIAL_FIREWALL_CONNECTIONS: FirewallConnection[] = [
  {
    id: 'conn-1',
    protocol: 'tcp',
    srcAddress: '10.10.1.100',
    srcPort: 54210,
    dstAddress: '140.82.121.4',
    dstPort: 443,
    replySrcAddress: '140.82.121.4',
    replyDstAddress: '118.69.144.82',
    tcpState: 'ESTABLISHED',
    timeout: '17h 58m 20s',
    origBytes: '184.2 MB',
    replyBytes: '942.8 MB',
    mark: 'FastTrack',
    service: 'GitHub HTTPS Web / Git Sync'
  },
  {
    id: 'conn-2',
    protocol: 'udp',
    srcAddress: '10.10.1.100',
    srcPort: 53120,
    dstAddress: '10.10.100.2',
    dstPort: 53,
    replySrcAddress: '10.10.100.2',
    replyDstAddress: '10.10.1.100',
    timeout: '00m 08s',
    origBytes: '840 B',
    replyBytes: '1.2 KB',
    mark: 'FastTrack',
    service: 'DNS Query (AdGuard Hijack)'
  },
  {
    id: 'conn-3',
    protocol: 'udp',
    srcAddress: '10.10.1.150',
    srcPort: 5060,
    dstAddress: '118.69.180.20',
    dstPort: 5060,
    replySrcAddress: '118.69.180.20',
    replyDstAddress: '118.69.144.82',
    timeout: '02m 54s',
    origBytes: '4.8 MB',
    replyBytes: '4.9 MB',
    mark: 'Prio_VoIP',
    service: 'VoIP SIP Session (QoS Tagged)'
  },
  {
    id: 'conn-4',
    protocol: 'tcp',
    srcAddress: '10.10.1.101',
    srcPort: 59102,
    dstAddress: '10.10.100.2',
    dstPort: 3000,
    replySrcAddress: '10.10.100.2',
    replyDstAddress: '10.10.1.101',
    tcpState: 'ESTABLISHED',
    timeout: '23h 59m 10s',
    origBytes: '28.1 MB',
    replyBytes: '82.4 MB',
    mark: 'Standard',
    service: 'Aegis Threat Intel REST API SSE'
  },
  {
    id: 'conn-5',
    protocol: 'tcp',
    srcAddress: '10.10.1.210',
    srcPort: 44122,
    dstAddress: '172.217.160.14',
    dstPort: 443,
    replySrcAddress: '172.217.160.14',
    replyDstAddress: '118.69.144.82',
    tcpState: 'ESTABLISHED',
    timeout: '14h 22m 11s',
    origBytes: '89.4 MB',
    replyBytes: '310.2 MB',
    mark: 'FastTrack',
    service: 'Google Cloud HTTPS / GSuite'
  },
  {
    id: 'conn-6',
    protocol: 'udp',
    srcAddress: '172.30.0.101',
    srcPort: 51820,
    dstAddress: '118.69.144.82',
    dstPort: 51820,
    replySrcAddress: '118.69.144.82',
    replyDstAddress: '172.30.0.101',
    timeout: '01m 20s',
    origBytes: '61.4 MB',
    replyBytes: '78.9 MB',
    mark: 'Standard',
    service: 'WireGuard Tunnel Handshake'
  },
  {
    id: 'conn-7',
    protocol: 'tcp',
    srcAddress: '185.220.101.5',
    srcPort: 41890,
    dstAddress: '118.69.144.82',
    dstPort: 22,
    replySrcAddress: '118.69.144.82',
    replyDstAddress: '185.220.101.5',
    tcpState: 'TIME_WAIT',
    timeout: '00m 45s',
    origBytes: '4.2 KB',
    replyBytes: '2.1 KB',
    mark: 'DDoS_Monitored',
    service: 'SSH Scan Attempt [Quarantined]'
  },
  {
    id: 'conn-8',
    protocol: 'icmp',
    srcAddress: '10.10.1.100',
    dstAddress: '8.8.8.8',
    replySrcAddress: '8.8.8.8',
    replyDstAddress: '118.69.144.82',
    timeout: '00m 05s',
    origBytes: '320 B',
    replyBytes: '320 B',
    mark: 'FastTrack',
    service: 'ICMP Keepalive Ping'
  }
];

export const ISP_PRESETS: PppoeProfile[] = [
  {
    id: 'fpt',
    name: 'FPT Telecom FTTH GPON',
    badge: 'FPT Telecom (Active Primary)',
    vlanId: 7,
    iface: 'ether1',
    username: 'hni_fpt8899@fpt',
    password: 'fpt@gpon2026',
    mtu: 1492,
    distance: 1,
    recommendation: 'VLAN 7 chuẩn hóa GPON Bridge. MTU 1492. Hỗ trợ IPv6 Prefix Delegation /56.',
    status: 'CONNECTED',
    uptime: '18d 04h 12m',
    ipAddress: '118.69.144.82',
    gateway: '118.69.144.1',
    usePeerDns: false,
    addDefaultRoute: true,
  },
  {
    id: 'viettel',
    name: 'Viettel Telecom GPON',
    badge: 'Viettel (Backup Standby)',
    vlanId: 35,
    iface: 'ether4',
    username: 't008_gpon_viettel123',
    password: 'viettel@ftth99',
    mtu: 1492,
    distance: 2,
    recommendation: 'VLAN 35 trên modem DASAN/ZTE/Huawei Bridge. Keepalive 10s tự động failover.',
    status: 'CONNECTED',
    uptime: '12d 19h 40m',
    ipAddress: '171.244.38.105',
    gateway: '171.244.38.1',
    usePeerDns: false,
    addDefaultRoute: true,
  },
  {
    id: 'vnpt',
    name: 'VNPT Vinaphone FiberVNN',
    badge: 'VNPT (Available Preset)',
    vlanId: 32,
    iface: 'ether1',
    username: 'hni_vnpt_fibervnn44',
    password: 'vnpt@fiber2026',
    mtu: 1492,
    distance: 3,
    recommendation: 'VLAN 32 chuẩn hóa mạng VNPT miền Bắc (hoặc VLAN 11). Tối ưu định tuyến cáp biển APG/AAG.',
    status: 'DISCONNECTED',
    uptime: '0s',
    ipAddress: '14.162.88.210',
    gateway: '14.162.88.1',
    usePeerDns: false,
    addDefaultRoute: false,
  }
];

export const DNS_STATS: DnsStats = {
  queriesTotal: 492140,
  blockedTotal: 84310,
  blockedPercent: 17.13,
  avgLatencyMs: 3.4,
  rulesCount: 384192
};

export const INITIAL_BLOCKED_SERVICES: BlockedService[] = [
  { id: 'minecraft', name: 'Minecraft Online', category: 'Gaming', icon: 'Gamepad2', blocked: true, count24h: 1420 },
  { id: 'roblox', name: 'Roblox Platform', category: 'Gaming', icon: 'Gamepad', blocked: true, count24h: 3280 },
  { id: 'gemini', name: 'Google Gemini AI', category: 'Artificial Intelligence', icon: 'Bot', blocked: true, count24h: 890 },
  { id: 'tiktok', name: 'TikTok & ByteDance', category: 'Social Media', icon: 'Share2', blocked: false, count24h: 18420 },
  { id: 'facebook', name: 'Facebook & Instagram', category: 'Social Media', icon: 'Globe', blocked: false, count24h: 31200 },
  { id: 'doh_bypass', name: 'Anti DoH/DoT Bypass', category: 'Security Enforce', icon: 'ShieldAlert', blocked: true, count24h: 12940 },
  { id: 'torrent', name: 'BitTorrent & P2P Trackers', category: 'File Sharing', icon: 'DownloadCloud', blocked: true, count24h: 490 },
  { id: 'discord', name: 'Discord Chat & Voice', category: 'Communications', icon: 'MessageSquare', blocked: false, count24h: 6420 },
  { id: 'steam', name: 'Steam Community & CDN', category: 'Gaming', icon: 'PlayCircle', blocked: false, count24h: 8120 },
  { id: 'pornography', name: 'Adult & Explicit Content', category: 'Content Safety', icon: 'EyeOff', blocked: true, count24h: 2190 },
  { id: 'tor', name: 'Tor Relay & Onion Exit', category: 'Anonymizer', icon: 'Key', blocked: true, count24h: 340 }
];

export const INITIAL_QUERY_LOG: DnsQueryLog[] = [
  { id: 'q-1', time: '10:24:15', domain: 'session.minecraft.net', clientIp: '10.10.1.100', clientName: 'ubuntu-desktop-105', type: 'A', status: 'BLOCKED', responseTime: '0.4 ms' },
  { id: 'q-2', time: '10:24:12', domain: 'generativelanguage.googleapis.com', clientIp: '10.10.1.100', clientName: 'ubuntu-desktop-105', type: 'HTTPS', status: 'BLOCKED', responseTime: '0.5 ms' },
  { id: 'q-3', time: '10:24:08', domain: 'panel.aegis.lan', clientIp: '10.10.1.101', clientName: 'noc-workstation-admin', type: 'A', status: 'REWRITTEN', responseTime: '0.2 ms' },
  { id: 'q-4', time: '10:24:01', domain: 'api.aegis.lan', clientIp: '10.10.100.10', clientName: 'aegis-panel-app', type: 'A', status: 'REWRITTEN', responseTime: '0.2 ms' },
  { id: 'q-5', time: '10:23:55', domain: 'dns.google', clientIp: '10.10.1.100', clientName: 'ubuntu-desktop-105', type: 'A', status: 'BLOCKED', responseTime: '0.3 ms' },
  { id: 'q-6', time: '10:23:44', domain: 'github.com', clientIp: '10.10.1.101', clientName: 'noc-workstation-admin', type: 'A', status: 'RESOLVED', responseTime: '4.8 ms' },
  { id: 'q-7', time: '10:23:38', domain: 'registry.npmjs.org', clientIp: '10.10.1.100', clientName: 'ubuntu-desktop-105', type: 'A', status: 'RESOLVED', responseTime: '6.2 ms' }
];

export const DNS_REWRITES: DnsRewrite[] = [
  { id: 'rw-1', domain: 'panel.aegis.lan', answer: '10.10.100.10', type: 'A', description: 'Aegis Cyber-NOC Next.js Web Interface' },
  { id: 'rw-2', domain: 'dns.aegis.lan', answer: '10.10.100.2', type: 'A', description: 'AdGuard Home Core Management UI' },
  { id: 'rw-3', domain: 'api.aegis.lan', answer: '10.10.100.2', type: 'A', description: 'Fastify GeoLite2 Threat Intelligence API' },
  { id: 'rw-4', domain: 'router.aegis.lan', answer: '10.10.1.1', type: 'A', description: 'MikroTik RouterOS REST API Gateway' },
  { id: 'rw-5', domain: 'fw.aegis.lan', answer: '10.254.254.1', type: 'A', description: 'Kernel Firewall XDP Out-of-band Interface' }
];

export const SPEEDTEST_SERVERS: SpeedtestServer[] = [
  { id: 'srv-1', name: 'FPT Telecom Server #1', isp: 'FPT Telecom', location: 'Hanoi, Vietnam', ping: 2 },
  { id: 'srv-2', name: 'Viettel IDC Hoa Lac', isp: 'Viettel Telecom', location: 'Hanoi, Vietnam', ping: 4 },
  { id: 'srv-3', name: 'VNPT Net International PoP', isp: 'VNPT', location: 'Da Nang, Vietnam', ping: 12 },
  { id: 'srv-4', name: 'Singtel Equinix SG1', isp: 'Singtel', location: 'Singapore', ping: 32 }
];

export const NETFLOW_SESSIONS: NetflowSession[] = [
  { id: 'nf-1', srcIp: '10.10.1.100:54210', dstIp: '140.82.121.4:443', proto: 'TCP', port: 443, bytes: '184.2 MB', pps: 420, mark: 'FastTrack' },
  { id: 'nf-2', srcIp: '10.10.1.150:5060', dstIp: '118.69.180.20:5060', proto: 'UDP', port: 5060, bytes: '4.8 MB', pps: 50, mark: 'Prio_VoIP' },
  { id: 'nf-3', srcIp: '10.10.1.101:59102', dstIp: '10.10.100.2:3000', proto: 'TCP', port: 3000, bytes: '28.1 MB', pps: 110, mark: 'Standard' },
  { id: 'nf-4', srcIp: '10.10.1.210:44122', dstIp: '172.217.160.14:443', proto: 'TCP', port: 443, bytes: '89.4 MB', pps: 280, mark: 'FastTrack' }
];

export const BACKUP_ITEMS: BackupItem[] = [
  { id: 'bk-1', filename: 'aegis-ros7-full-20261016-0400.backup', target: 'MikroTik RouterOS', size: '1.4 MB', created: '2026-10-16 04:00:00', hash: 'e8b4...192f' },
  { id: 'bk-2', filename: 'xdp-firewall-ebpf-maps-20261016.tar.gz', target: 'Kernel XDP Firewall', size: '4.2 MB', created: '2026-10-16 03:00:00', hash: 'a12c...881e' },
  { id: 'bk-3', filename: 'adguard-config-rules-20261016.yaml', target: 'AdGuard Home', size: '280 KB', created: '2026-10-16 02:00:00', hash: 'd901...33aa' }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', timestamp: '10:24:02', operator: 'admin@aegis.local', action: 'FIREWALL_MODULE_TOGGLE', target: 'syn_flood', severity: 'INFO', details: 'Module state confirmed ACTIVE [DROP mode]' },
  { id: 'log-2', timestamp: '10:20:11', operator: 'system-agent', action: 'DNS_HIJACK_ENFORCE', target: 'ether2-LAN', severity: 'WARN', details: 'Redirected hardcoded DNS queries from 10.10.1.100 to 10.10.100.2' },
  { id: 'log-3', timestamp: '10:14:02', operator: 'aegis-threat-engine', action: 'AUTOBAN_TRIGGERED', target: '185.220.101.5', severity: 'CRIT', details: 'Exceeded SSH login threshold: 80 req/min' },
  { id: 'log-4', timestamp: '09:55:00', operator: 'admin@aegis.local', action: 'DNS_SERVICE_BLOCK', target: 'gemini', severity: 'INFO', details: 'Added Google Gemini to active blacklist' }
];

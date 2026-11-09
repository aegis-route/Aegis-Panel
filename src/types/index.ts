export type ActiveTab =
  | 'overview'          // 1. Tổng quan NOC & An ninh mạng (NOC Dashboard & Architecture)
  | 'ddos-shield'       // 2. Phòng thủ DDoS & Lọc gói tin (Anti-DDoS & Packet Filtering)
  | 'network-gateway'   // 3. Hạ tầng Mạng, Cổng kết nối & NAT (Network, Routing & NAT)
  | 'content-security'  // 4. Lọc nội dung & Kiểm soát truy cập (Content Filter & Access Control)
  | 'traffic-sla'       // 5. Phân tích lưu lượng & Hiệu năng SLA (Traffic Analytics & SLA)
  | 'system-vault';     // 6. Quản trị hệ thống & Sao lưu (Administration & Security Vault)

// 1. Anti-DDoS & Packet Filter Types
export interface FirewallModule {
  id: string;
  name: string;
  description: string;
  mode: 'DROP' | 'OFF' | 'MONITOR';
  status: 'ACTIVE' | 'STANDBY' | 'DISABLED';
  drops: number;
  pps: number;
  latency: string;
  category: 'L3/L4' | 'Application' | 'Protocol' | 'Stateful';
}

export interface AutoBanEntry {
  id: string;
  ip: string;
  country: string;
  countryCode: string;
  reason: string;
  bannedAt: string;
  expires: string;
  score: number;
}

export interface CidrRule {
  id: string;
  cidr: string;
  action: 'ALLOW' | 'DROP';
  comment: string;
  hits: number;
  added: string;
}

// 2. Network & Gateway Types
export interface NetworkPort {
  id: number;
  name: string;
  label: string;
  status: 'UP' | 'DOWN';
  speed: string;
  duplex: string;
  vlan: number;
  ip?: string;
  rx: string;
  tx: string;
  type: 'WAN' | 'LAN' | 'SFP' | 'MGMT';
}

export interface DhcpLease {
  id: string;
  ip: string;
  mac: string;
  hostname: string;
  status: 'bound' | 'waiting';
  expires: string;
  fastTrack: boolean;
}

export interface NatRule {
  id: number;
  chain: 'dstnat' | 'srcnat';
  proto: 'tcp' | 'udp' | 'all';
  inInterface: string;
  dstPort: string;
  toAddress: string;
  toPort: string;
  comment: string;
  packets: number;
  enabled?: boolean;
}

export interface FirewallConnection {
  id: string;
  protocol: 'tcp' | 'udp' | 'icmp';
  srcAddress: string;
  srcPort?: number;
  dstAddress: string;
  dstPort?: number;
  replySrcAddress?: string;
  replyDstAddress?: string;
  tcpState?: 'ESTABLISHED' | 'TIME_WAIT' | 'SYN_SENT' | 'SYN_RECV' | 'CLOSE_WAIT' | 'LAST_ACK';
  timeout: string;
  origBytes: string;
  replyBytes: string;
  mark: 'FastTrack' | 'Standard' | 'Prio_VoIP' | 'DDoS_Monitored';
  service?: string;
}

export interface PppoeProfile {
  id: string;
  name: string;
  badge: string;
  vlanId: number;
  iface: string;
  username: string;
  password?: string;
  mtu: number;
  distance: number;
  recommendation: string;
  serviceName?: string;
  usePeerDns?: boolean;
  addDefaultRoute?: boolean;
  status?: 'CONNECTED' | 'DISCONNECTED' | 'DIALING';
  uptime?: string;
  ipAddress?: string;
  gateway?: string;
}

// 3. Content Filtering & DNS Types
export interface DnsStats {
  queriesTotal: number;
  blockedTotal: number;
  blockedPercent: number;
  avgLatencyMs: number;
  rulesCount: number;
}

export interface BlockedService {
  id: string;
  name: string;
  category: string;
  icon: string;
  blocked: boolean;
  count24h: number;
}

export interface DnsQueryLog {
  id: string;
  time: string;
  domain: string;
  clientIp: string;
  clientName: string;
  type: 'A' | 'AAAA' | 'HTTPS' | 'PTR';
  status: 'BLOCKED' | 'RESOLVED' | 'REWRITTEN';
  responseTime: string;
}

export interface DnsRewrite {
  id: string;
  domain: string;
  answer: string;
  type: string;
  description: string;
}

// 4. Traffic & SLA Types
export interface SpeedtestServer {
  id: string;
  name: string;
  isp: string;
  location: string;
  ping: number;
  type?: 'cloudflare' | 'local' | 'probe' | 'custom';
  endpoint?: string;
  downloadBytes?: number;
}

export interface NetflowSession {
  id: string;
  srcIp: string;
  dstIp: string;
  proto: 'TCP' | 'UDP' | 'ICMP';
  port: number;
  bytes: string;
  pps: number;
  mark: 'FastTrack' | 'Standard' | 'Prio_VoIP';
}

// 5. System Vault & Audit Types
export interface BackupItem {
  id: string;
  filename: string;
  target: string;
  size: string;
  created: string;
  hash: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  operator: string;
  action: string;
  target: string;
  severity: 'INFO' | 'WARN' | 'CRIT';
  details: string;
}

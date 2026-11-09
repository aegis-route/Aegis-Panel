import {
  FirewallModule,
  AutoBanEntry,
  CidrRule,
  DhcpLease,
  NatRule,
  PppoeProfile,
  FirewallConnection,
  BlockedService,
  BackupItem,
  AuditLog,
  DnsStats,
  DnsQueryLog,
  DnsRewrite,
  NetworkPort
} from '../types';
import {
  INITIAL_FIREWALL_MODULES,
  INITIAL_AUTOBAN_LIST,
  INITIAL_CIDR_RULES,
  NETWORK_PORTS,
  INITIAL_DHCP_LEASES,
  INITIAL_NAT_RULES,
  ISP_PRESETS,
  INITIAL_FIREWALL_CONNECTIONS,
  DNS_STATS,
  INITIAL_BLOCKED_SERVICES,
  INITIAL_QUERY_LOG,
  DNS_REWRITES,
  BACKUP_ITEMS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';

export interface NodeHealth {
  name: string;
  nodeId: string;
  ip: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  latencyMs: number;
  lastCheck: string;
  details: string;
}

export interface ClusterHealthStatus {
  overall: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  nodes: {
    kernelFw: NodeHealth;
    mikrotik: NodeHealth;
    adguard: NodeHealth;
    aegisApi: NodeHealth;
    panelBff: NodeHealth;
  };
  mode: 'LIVE_CONNECTED' | 'ADAPTIVE_STANDALONE';
}

class AegisServerStore {
  private static instance: AegisServerStore;

  public modules: FirewallModule[] = [...INITIAL_FIREWALL_MODULES];
  public autoBanList: AutoBanEntry[] = [...INITIAL_AUTOBAN_LIST];
  public cidrRules: CidrRule[] = [...INITIAL_CIDR_RULES];
  public ports: NetworkPort[] = [...NETWORK_PORTS];
  public leases: DhcpLease[] = [...INITIAL_DHCP_LEASES];
  public natRules: NatRule[] = [...INITIAL_NAT_RULES];
  public pppoeProfiles: PppoeProfile[] = [...ISP_PRESETS];
  public connections: FirewallConnection[] = [...INITIAL_FIREWALL_CONNECTIONS];
  public dnsStats: DnsStats = { ...DNS_STATS };
  public dnsServices: BlockedService[] = [...INITIAL_BLOCKED_SERVICES];
  public queryLogs: DnsQueryLog[] = [...INITIAL_QUERY_LOG];
  public rewrites: DnsRewrite[] = [...DNS_REWRITES];
  public backups: BackupItem[] = [...BACKUP_ITEMS];
  public auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];

  // Telemetry real-time state (starts from zero clean state)
  public telemetry = {
    throughputMbps: 0.0,
    pps: 0,
    totalDrops: 0,
    activeSessions: 0,
    lockdown: false,
    updatedAt: new Date().toISOString()
  };

  private constructor() {
    // Initialise store
  }

  public static getInstance(): AegisServerStore {
    if (!AegisServerStore.instance) {
      AegisServerStore.instance = new AegisServerStore();
    }
    return AegisServerStore.instance;
  }

  public addAuditLog(action: string, target: string, severity: 'INFO' | 'WARN' | 'CRIT', details: string, operator = 'admin@aegis'): AuditLog {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
      operator,
      action,
      target,
      severity,
      details
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop();
    }
    return log;
  }

  public updateTelemetry(): typeof this.telemetry {
    // Calculate telemetry strictly from active connections & actual module drops
    const totalDropsFromModules = this.modules.reduce((acc, m) => acc + (m.drops || 0), 0);
    const totalPpsFromModules = this.modules.reduce((acc, m) => acc + (m.pps || 0), 0);

    this.telemetry = {
      ...this.telemetry,
      activeSessions: this.connections.length,
      totalDrops: totalDropsFromModules,
      pps: totalPpsFromModules,
      updatedAt: new Date().toISOString()
    };
    return this.telemetry;
  }
}

export const serverStore = AegisServerStore.getInstance();

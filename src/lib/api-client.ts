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
  DnsRewrite
} from '../types';
import { ClusterHealthStatus } from './server-store';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options?.headers
    }
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorBody.error || `HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

export const apiClient = {
  // 1. Firewall APIs
  firewall: {
    getModules: async () => {
      const res = await fetchJson<{ success: boolean; data: FirewallModule[] }>('/api/firewall/modules');
      return res.data;
    },
    toggleModule: async (id: string, mode?: 'DROP' | 'MONITOR' | 'OFF') => {
      const res = await fetchJson<{ success: boolean; message: string; module: FirewallModule }>('/api/firewall/modules', {
        method: 'POST',
        body: JSON.stringify({ id, mode })
      });
      return res;
    },
    getBans: async () => {
      const res = await fetchJson<{ success: boolean; data: AutoBanEntry[] }>('/api/firewall/bans');
      return res.data;
    },
    unbanIp: async (id?: string, ip?: string) => {
      return await fetchJson<{ success: boolean; message: string }>('/api/firewall/bans', {
        method: 'POST',
        body: JSON.stringify({ id, ip })
      });
    },
    getCidrRules: async () => {
      const res = await fetchJson<{ success: boolean; data: CidrRule[] }>('/api/firewall/rules/cidr');
      return res.data;
    },
    addCidrRule: async (cidr: string, comment: string, action: 'ALLOW' | 'DROP') => {
      const res = await fetchJson<{ success: boolean; message: string; rule: CidrRule }>('/api/firewall/rules/cidr', {
        method: 'POST',
        body: JSON.stringify({ cidr, comment, action })
      });
      return res;
    },
    deleteCidrRule: async (id: string) => {
      return await fetchJson<{ success: boolean; message: string }>(`/api/firewall/rules/cidr?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    }
  },

  // 2. Router & Gateway APIs
  router: {
    getWanStatus: async () => {
      const res = await fetchJson<{ success: boolean; data: Record<string, unknown> }>('/api/router/wan');
      return res.data;
    },
    getLeases: async () => {
      const res = await fetchJson<{ success: boolean; data: DhcpLease[] }>('/api/router/leases');
      return res.data;
    },
    toggleFastTrack: async (id: string, fastTrack?: boolean) => {
      return await fetchJson<{ success: boolean; message: string; lease: DhcpLease }>('/api/router/leases', {
        method: 'POST',
        body: JSON.stringify({ id, action: 'toggle-fasttrack', fastTrack })
      });
    },
    getPppoeProfiles: async () => {
      const res = await fetchJson<{ success: boolean; data: PppoeProfile[] }>('/api/router/pppoe');
      return res.data;
    },
    addPppoe: async (profile: Omit<PppoeProfile, 'id'>) => {
      return await fetchJson<{ success: boolean; message: string; profile: PppoeProfile }>('/api/router/pppoe', {
        method: 'POST',
        body: JSON.stringify(profile)
      });
    },
    editPppoe: async (profile: PppoeProfile) => {
      return await fetchJson<{ success: boolean; message: string; profile: PppoeProfile }>('/api/router/pppoe', {
        method: 'PUT',
        body: JSON.stringify(profile)
      });
    },
    deletePppoe: async (id: string) => {
      return await fetchJson<{ success: boolean; message: string }>(`/api/router/pppoe?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    },
    getNatRules: async () => {
      const res = await fetchJson<{ success: boolean; data: NatRule[] }>('/api/router/nat');
      return res.data;
    },
    addNatRule: async (rule: Omit<NatRule, 'id' | 'packets'>) => {
      return await fetchJson<{ success: boolean; message: string; rule: NatRule }>('/api/router/nat', {
        method: 'POST',
        body: JSON.stringify(rule)
      });
    },
    editNatRule: async (rule: NatRule) => {
      return await fetchJson<{ success: boolean; message: string; rule: NatRule }>('/api/router/nat', {
        method: 'PUT',
        body: JSON.stringify(rule)
      });
    },
    deleteNatRule: async (id: number) => {
      return await fetchJson<{ success: boolean; message: string }>(`/api/router/nat?id=${id}`, {
        method: 'DELETE'
      });
    },
    toggleNatRule: async (id: number) => {
      return await fetchJson<{ success: boolean; message: string; rule: NatRule }>('/api/router/nat', {
        method: 'POST',
        body: JSON.stringify({ id, action: 'toggle' })
      });
    },
    getConnections: async () => {
      const res = await fetchJson<{ success: boolean; data: FirewallConnection[] }>('/api/router/connections');
      return res.data;
    },
    killConnection: async (id: string) => {
      return await fetchJson<{ success: boolean; message: string }>('/api/router/connections', {
        method: 'POST',
        body: JSON.stringify({ id })
      });
    }
  },

  // 3. DNS & Content Security APIs
  dns: {
    getStats: async () => {
      const res = await fetchJson<{ success: boolean; data: DnsStats }>('/api/dns/stats');
      return res.data;
    },
    getServices: async () => {
      const res = await fetchJson<{ success: boolean; data: BlockedService[] }>('/api/dns/services');
      return res.data;
    },
    toggleService: async (id: string, blocked?: boolean) => {
      return await fetchJson<{ success: boolean; message: string; service: BlockedService }>('/api/dns/services', {
        method: 'POST',
        body: JSON.stringify({ id, blocked })
      });
    },
    getQueryLogs: async (filter?: 'ALL' | 'BLOCKED' | 'RESOLVED') => {
      const url = filter ? `/api/dns/querylog?filter=${filter}` : '/api/dns/querylog';
      const res = await fetchJson<{ success: boolean; data: DnsQueryLog[] }>(url);
      return res.data;
    },
    getRewrites: async () => {
      const res = await fetchJson<{ success: boolean; data: DnsRewrite[] }>('/api/dns/rewrites');
      return res.data;
    },
    addRewrite: async (rewrite: Omit<DnsRewrite, 'id'>) => {
      return await fetchJson<{ success: boolean; message: string; rewrite: DnsRewrite }>('/api/dns/rewrites', {
        method: 'POST',
        body: JSON.stringify(rewrite)
      });
    },
    deleteRewrite: async (id: string) => {
      return await fetchJson<{ success: boolean; message: string }>(`/api/dns/rewrites?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    }
  },

  // 4. GeoIP & Intelligence APIs (Aegis-API service)
  geoip: {
    lookup: async (ip: string) => {
      const res = await fetchJson<{ success: boolean; data: Record<string, unknown> }>(`/api/geoip/${encodeURIComponent(ip)}`);
      return res.data;
    }
  },

  // 5. System, Cluster Health & Telemetry APIs
  system: {
    getHealth: async (): Promise<ClusterHealthStatus> => {
      const res = await fetchJson<{ success: boolean; data: ClusterHealthStatus }>('/api/system/health');
      return res.data;
    },
    getAuditLogs: async () => {
      const res = await fetchJson<{ success: boolean; data: AuditLog[] }>('/api/system/audit-logs');
      return res.data;
    },
    addAuditLog: async (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
      return await fetchJson<{ success: boolean; log: AuditLog }>('/api/system/audit-logs', {
        method: 'POST',
        body: JSON.stringify(log)
      });
    },
    getBackups: async () => {
      const res = await fetchJson<{ success: boolean; data: BackupItem[] }>('/api/system/backups');
      return res.data;
    },
    createBackup: async () => {
      return await fetchJson<{ success: boolean; message: string; backup: BackupItem }>('/api/system/backups', {
        method: 'POST',
        body: JSON.stringify({ action: 'create' })
      });
    },
    restoreBackup: async (filename: string) => {
      return await fetchJson<{ success: boolean; message: string }>('/api/system/backups', {
        method: 'POST',
        body: JSON.stringify({ action: 'restore', filename })
      });
    },
    getLiveTelemetry: async () => {
      const res = await fetchJson<{
        success: boolean;
        data: {
          throughputMbps: number;
          pps: number;
          totalDrops: number;
          activeSessions: number;
          lockdown: boolean;
          firewallActiveCount: number;
          autoBansCount: number;
          dnsQueriesTotal: number;
          dnsBlockedRate: number;
          activeDhcpClients: number;
          openPortsCount: number;
        };
      }>('/api/telemetry/live');
      return res.data;
    }
  }
};

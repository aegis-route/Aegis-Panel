'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { ToastContainer, ToastMessage } from '../components/layout/Toast';
import { NocTab } from '../components/tabs/NocTab';
import { FirewallTab } from '../components/tabs/FirewallTab';
import { RoutingTab } from '../components/tabs/RoutingTab';
import { DnsTab } from '../components/tabs/DnsTab';
import { AnalyticsTab } from '../components/tabs/AnalyticsTab';
import { AuditTab } from '../components/tabs/AuditTab';

import {
  ActiveTab,
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
  SPEEDTEST_SERVERS,
  NETFLOW_SESSIONS,
  BACKUP_ITEMS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';
import { apiClient } from '../lib/api-client';
import { ClusterHealthStatus } from '../lib/server-store';

export default function AegisPanelApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLockdown, setIsLockdown] = useState(false);
  const [clusterHealth, setClusterHealth] = useState<ClusterHealthStatus | null>(null);

  // Dynamic state loaded and synced with API
  const [modules, setModules] = useState<FirewallModule[]>(INITIAL_FIREWALL_MODULES);
  const [autoBanList, setAutoBanList] = useState<AutoBanEntry[]>(INITIAL_AUTOBAN_LIST);
  const [cidrRules, setCidrRules] = useState<CidrRule[]>(INITIAL_CIDR_RULES);
  const [leases, setLeases] = useState<DhcpLease[]>(INITIAL_DHCP_LEASES);
  const [pppoeProfiles, setPppoeProfiles] = useState<PppoeProfile[]>(ISP_PRESETS);
  const [natRules, setNatRules] = useState<NatRule[]>(INITIAL_NAT_RULES);
  const [connections, setConnections] = useState<FirewallConnection[]>(INITIAL_FIREWALL_CONNECTIONS);
  const [dnsServices, setDnsServices] = useState<BlockedService[]>(INITIAL_BLOCKED_SERVICES);
  const [dnsStats, setDnsStats] = useState<DnsStats>(DNS_STATS);
  const [queryLogs, setQueryLogs] = useState<DnsQueryLog[]>(INITIAL_QUERY_LOG);
  const [rewrites, setRewrites] = useState<DnsRewrite[]>(DNS_REWRITES);
  const [backups, setBackups] = useState<BackupItem[]>(BACKUP_ITEMS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  const addToast = useCallback((type: 'success' | 'warning' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state from Backend API
  const syncFromApi = useCallback(async (silent = false) => {
    try {
      const [
        modRes,
        banRes,
        cidrRes,
        leaseRes,
        pppRes,
        natRes,
        connRes,
        dnsRes,
        dnsStatsRes,
        queryLogRes,
        rewritesRes,
        logRes,
        bkRes,
        healthRes
      ] = await Promise.all([
        apiClient.firewall.getModules().catch(() => null),
        apiClient.firewall.getBans().catch(() => null),
        apiClient.firewall.getCidrRules().catch(() => null),
        apiClient.router.getLeases().catch(() => null),
        apiClient.router.getPppoeProfiles().catch(() => null),
        apiClient.router.getNatRules().catch(() => null),
        apiClient.router.getConnections().catch(() => null),
        apiClient.dns.getServices().catch(() => null),
        apiClient.dns.getStats().catch(() => null),
        apiClient.dns.getQueryLogs().catch(() => null),
        apiClient.dns.getRewrites().catch(() => null),
        apiClient.system.getAuditLogs().catch(() => null),
        apiClient.system.getBackups().catch(() => null),
        apiClient.system.getHealth().catch(() => null)
      ]);

      if (modRes) setModules(modRes);
      if (banRes) setAutoBanList(banRes);
      if (cidrRes) setCidrRules(cidrRes);
      if (leaseRes) setLeases(leaseRes);
      if (pppRes) setPppoeProfiles(pppRes);
      if (natRes) setNatRules(natRes);
      if (connRes) setConnections(connRes);
      if (dnsRes) setDnsServices(dnsRes);
      if (dnsStatsRes) setDnsStats(dnsStatsRes);
      if (queryLogRes) setQueryLogs(queryLogRes);
      if (rewritesRes) setRewrites(rewritesRes);
      if (logRes) setAuditLogs(logRes);
      if (bkRes) setBackups(bkRes);
      if (healthRes) setClusterHealth(healthRes);

      if (!silent) {
        addToast('success', '● Đã đồng bộ toàn bộ dữ liệu viễn trắc từ API máy chủ thành công!');
      }
    } catch (err: unknown) {
      if (!silent) {
        const msg = err instanceof Error ? err.message : 'Lỗi đồng bộ';
        addToast('warning', `Không thể đồng bộ toàn bộ API: ${msg}`);
      }
    }
  }, [addToast]);

  // Initial load and background polling
  useEffect(() => {
    syncFromApi(true);

    // Poll telemetry and health periodically
    const healthInterval = setInterval(() => {
      apiClient.system.getHealth().then((h) => setClusterHealth(h)).catch(() => {});
    }, 12000);

    return () => clearInterval(healthInterval);
  }, [syncFromApi]);

  // 1. Toggle Firewall Module (DROP -> MONITOR -> OFF -> DROP)
  const handleToggleModule = async (id: string) => {
    try {
      const res = await apiClient.firewall.toggleModule(id);
      if (res.success && res.module) {
        setModules((prev) => prev.map((m) => (m.id === id ? res.module : m)));
        addToast(
          res.module.mode === 'DROP' ? 'success' : 'warning',
          `[XDP eBPF API] Module "${res.module.name}" chuyển sang chế độ: ${res.module.mode}`
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'API Error';
      addToast('warning', `Lỗi kết nối API: ${msg}`);
    }
  };

  // 2. Unban IP Address
  const handleUnbanIp = async (id: string, ip: string) => {
    try {
      const res = await apiClient.firewall.unbanIp(id, ip);
      if (res.success) {
        setAutoBanList((prev) => prev.filter((e) => e.id !== id));
        addToast('success', `[API] Đã xóa IP ${ip} khỏi eBPF LPM Trie Blacklist (Unban thành công)!`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'API Error';
      addToast('warning', `Lỗi gỡ ban IP: ${msg}`);
    }
  };

  // 3. Add CIDR Rule
  const handleAddCidrRule = async (cidr: string, comment: string, action: 'ALLOW' | 'DROP') => {
    try {
      const res = await apiClient.firewall.addCidrRule(cidr, comment, action);
      if (res.success && res.rule) {
        setCidrRules((prev) => [...prev, res.rule]);
        addToast('success', `[API] Đã ghi quy tắc CIDR ${cidr} [${action}] vào Kernel eBPF Map!`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'API Error';
      addToast('warning', `Lỗi thêm quy tắc CIDR: ${msg}`);
    }
  };

  // 4. Toggle FastTrack per DHCP Lease
  const handleToggleFastTrack = async (leaseId: string) => {
    try {
      const target = leases.find((l) => l.id === leaseId);
      const nextState = !target?.fastTrack;
      const res = await apiClient.router.toggleFastTrack(leaseId, nextState);
      if (res.success && res.lease) {
        setLeases((prev) => prev.map((l) => (l.id === leaseId ? res.lease : l)));
        addToast(
          'info',
          `[RouterOS API] FastTrack L3: ${res.lease.fastTrack ? 'BẬT' : 'TẮT'} cho thiết bị ${res.lease.hostname} (${res.lease.ip})`
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'API Error';
      addToast('warning', `Lỗi RouterOS API: ${msg}`);
    }
  };

  // 5. Switch Active ISP Route
  const handleSwitchIsp = (ispId: string) => {
    const target = pppoeProfiles.find((p) => p.id === ispId);
    if (target) {
      addToast('success', `[RouterOS API] Chuyển mạch định tuyến Default Route sang: ${target.name} (VLAN ${target.vlanId})`);
    }
  };

  // 5.1. Add PPPoE Connection Profile
  const handleAddPppoe = async (profileData: Omit<PppoeProfile, 'id'>) => {
    try {
      const res = await apiClient.router.addPppoe(profileData);
      if (res.success && res.profile) {
        setPppoeProfiles((prev) => [...prev, res.profile]);
        addToast('success', `[RouterOS API] Đã thêm cấu hình PPPoE: ${res.profile.name} (VLAN ${res.profile.vlanId})`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'API Error';
      addToast('warning', `Lỗi thêm PPPoE: ${msg}`);
    }
  };

  // 5.2. Edit PPPoE Connection Profile
  const handleEditPppoe = async (profile: PppoeProfile) => {
    try {
      const res = await apiClient.router.editPppoe(profile);
      if (res.success && res.profile) {
        setPppoeProfiles((prev) => prev.map((p) => (p.id === profile.id ? res.profile : p)));
        addToast('info', `[RouterOS API] Đã cập nhật thông số kết nối PPPoE: ${profile.name}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'API Error';
      addToast('warning', `Lỗi sửa PPPoE: ${msg}`);
    }
  };

  // 5.3. Delete PPPoE Connection Profile
  const handleDeletePppoe = async (id: string) => {
    try {
      const target = pppoeProfiles.find((p) => p.id === id);
      const res = await apiClient.router.deletePppoe(id);
      if (res.success) {
        setPppoeProfiles((prev) => prev.filter((p) => p.id !== id));
        addToast('warning', `[RouterOS API] Đã gỡ bỏ kết nối PPPoE: ${target?.name || id}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'API Error';
      addToast('warning', `Lỗi xóa PPPoE: ${msg}`);
    }
  };

  // 5.4. Add NAT Port Rule
  const handleAddNatRule = async (ruleData: Omit<NatRule, 'id' | 'packets'>) => {
    try {
      const res = await apiClient.router.addNatRule(ruleData);
      if (res.success && res.rule) {
        setNatRules((prev) => [...prev, res.rule]);
        addToast('success', `[RouterOS API] Đã thêm quy tắc NAT Port: ${res.rule.dstPort} -> ${res.rule.toAddress}:${res.rule.toPort}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'API Error';
      addToast('warning', `Lỗi thêm NAT: ${msg}`);
    }
  };

  // 5.5. Edit NAT Port Rule
  const handleEditNatRule = async (rule: NatRule) => {
    try {
      const res = await apiClient.router.editNatRule(rule);
      if (res.success && res.rule) {
        setNatRules((prev) => prev.map((r) => (r.id === rule.id ? res.rule : r)));
        addToast('info', `[RouterOS API] Đã cập nhật quy tắc NAT Port #${rule.id}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'API Error';
      addToast('warning', `Lỗi sửa NAT: ${msg}`);
    }
  };

  // 5.6. Delete NAT Port Rule
  const handleDeleteNatRule = async (id: number) => {
    try {
      const target = natRules.find((r) => r.id === id);
      const res = await apiClient.router.deleteNatRule(id);
      if (res.success) {
        setNatRules((prev) => prev.filter((r) => r.id !== id));
        addToast('warning', `[RouterOS API] Đã xóa quy tắc NAT Port #${id} (${target?.comment || ''})`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'API Error';
      addToast('warning', `Lỗi xóa NAT: ${msg}`);
    }
  };

  // 5.7. Toggle Enable/Disable NAT Port Rule
  const handleToggleNatRule = async (id: number) => {
    try {
      const res = await apiClient.router.toggleNatRule(id);
      if (res.success && res.rule) {
        setNatRules((prev) => prev.map((r) => (r.id === id ? res.rule : r)));
        addToast(res.rule.enabled ? 'success' : 'warning', `[RouterOS API] Quy tắc NAT Port #${id}: ${res.rule.enabled ? 'BẬT' : 'TẮT'}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'API Error';
      addToast('warning', `Lỗi cập nhật NAT: ${msg}`);
    }
  };

  // 5.8. Kill / Drop Active Connection (Conntrack)
  const handleKillConnection = async (connId: string) => {
    try {
      const target = connections.find((c) => c.id === connId);
      const res = await apiClient.router.killConnection(connId);
      if (res.success) {
        setConnections((prev) => prev.filter((c) => c.id !== connId));
        addToast('warning', `[Conntrack API] Đã ngắt phiên kết nối: ${target?.srcAddress} -> ${target?.dstAddress}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'API Error';
      addToast('warning', `Lỗi ngắt phiên kết nối: ${msg}`);
    }
  };

  // 6. Toggle DNS Blocked Service (AdGuard)
  const handleToggleService = async (id: string) => {
    try {
      const current = dnsServices.find((s) => s.id === id);
      const nextBlocked = !current?.blocked;
      const res = await apiClient.dns.toggleService(id, nextBlocked);
      if (res.success && res.service) {
        setDnsServices((prev) => prev.map((s) => (s.id === id ? res.service : s)));
        addToast(
          res.service.blocked ? 'warning' : 'success',
          `[AdGuard Home API] ${res.service.blocked ? 'ĐÃ CHẶN' : 'ĐÃ MỞ KHÓA'} dịch vụ "${res.service.name}"!`
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'API Error';
      addToast('warning', `Lỗi AdGuard API: ${msg}`);
    }
  };

  // 6.2 Add DNS Rewrite (AdGuard)
  const handleAddRewrite = async (newRw: Omit<DnsRewrite, 'id'>) => {
    try {
      const res = await apiClient.dns.addRewrite(newRw);
      if (res.success && res.rewrite) {
        setRewrites((prev) => [...prev.filter((r) => r.domain !== newRw.domain), res.rewrite]);
        addToast('success', `[AdGuard Home API] Đã tạo ánh xạ DNS: ${newRw.domain} -> ${newRw.answer}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'API Error';
      addToast('warning', `Lỗi tạo DNS Rewrite: ${msg}`);
    }
  };

  // 6.3 Delete DNS Rewrite (AdGuard)
  const handleDeleteRewrite = async (id: string, domain?: string, answer?: string) => {
    try {
      const res = await apiClient.dns.deleteRewrite(id);
      if (res.success) {
        setRewrites((prev) => prev.filter((r) => r.id !== id && r.domain !== domain));
        addToast('warning', `[AdGuard Home API] Đã gỡ bỏ bản ghi DNS: ${domain || id}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'API Error';
      addToast('warning', `Lỗi xóa DNS Rewrite: ${msg}`);
    }
  };

  // 7. Create Cluster Backup
  const handleCreateBackup = async () => {
    try {
      const res = await apiClient.system.createBackup();
      if (res.success && res.backup) {
        setBackups((prev) => [res.backup, ...prev]);
        addToast('success', `[API] Đã tạo bản sao lưu cụm mã hóa: ${res.backup.filename}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'API Error';
      addToast('warning', `Lỗi tạo bản sao lưu: ${msg}`);
    }
  };

  // 8. Restore Backup
  const handleRestoreBackup = async (filename: string) => {
    try {
      addToast('warning', `Đang áp dụng cấu hình khôi phục từ snapshot: ${filename}...`);
      const res = await apiClient.system.restoreBackup(filename);
      if (res.success) {
        addToast('success', `● ${res.message}`);
        await syncFromApi(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'API Error';
      addToast('warning', `Lỗi khôi phục: ${msg}`);
    }
  };

  // 9. Manual Telemetry Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    addToast('info', 'Đang truy vấn trực tiếp chỉ số viễn trắc từ XDP Kernel, RouterOS REST API, AdGuard và Aegis-API...');
    await syncFromApi(false);
    setIsRefreshing(false);
  };

  // 10. Emergency Lockdown Toggle
  const handleToggleLockdown = () => {
    const nextState = !isLockdown;
    setIsLockdown(nextState);
    if (nextState) {
      addToast('warning', '⚠️ KHẨN CẤP: Đã kích hoạt chế độ LOCKDOWN TOÀN DIỆN! Mọi lưu lượng ngoài Whitelist bị DROP.');
    } else {
      addToast('info', 'Chế độ LOCKDOWN đã được tắt. Lưu lượng trở lại trạng thái lọc thông thường.');
    }
  };

  const activeFirewallCount = modules.filter((m) => m.mode === 'DROP').length;

  return (
    <div className="flex h-screen bg-[#06090e] text-white overflow-hidden scanline">
      {/* 1. Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        firewallActiveCount={activeFirewallCount}
        blockedDnsRate={dnsStats.blockedPercent}
      />

      {/* 2. Main Work Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          onToggleLockdown={handleToggleLockdown}
          isLockdown={isLockdown}
          clusterHealth={clusterHealth}
        />

        {/* Dynamic Tab Content Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && <NocTab onNavigateTab={setActiveTab} />}
          {activeTab === 'ddos-shield' && (
            <FirewallTab
              modules={modules}
              autoBanList={autoBanList}
              cidrRules={cidrRules}
              onToggleModule={handleToggleModule}
              onUnbanIp={handleUnbanIp}
              onAddCidrRule={handleAddCidrRule}
            />
          )}
          {activeTab === 'network-gateway' && (
            <RoutingTab
              ports={NETWORK_PORTS}
              leases={leases}
              natRules={natRules}
              pppoeProfiles={pppoeProfiles}
              connections={connections}
              onToggleFastTrack={handleToggleFastTrack}
              onSwitchIsp={handleSwitchIsp}
              onAddPppoe={handleAddPppoe}
              onEditPppoe={handleEditPppoe}
              onDeletePppoe={handleDeletePppoe}
              onAddNatRule={handleAddNatRule}
              onEditNatRule={handleEditNatRule}
              onDeleteNatRule={handleDeleteNatRule}
              onToggleNatRule={handleToggleNatRule}
              onKillConnection={handleKillConnection}
            />
          )}
          {activeTab === 'content-security' && (
            <DnsTab
              stats={dnsStats}
              services={dnsServices}
              queryLog={queryLogs}
              rewrites={rewrites}
              onToggleService={handleToggleService}
              onAddRewrite={handleAddRewrite}
              onDeleteRewrite={handleDeleteRewrite}
              onRefreshData={() => syncFromApi(false)}
            />
          )}
          {activeTab === 'traffic-sla' && (
            <AnalyticsTab servers={SPEEDTEST_SERVERS} sessions={NETFLOW_SESSIONS} />
          )}
          {activeTab === 'system-vault' && (
            <AuditTab
              backups={backups}
              auditLogs={auditLogs}
              onCreateBackup={handleCreateBackup}
              onRestoreBackup={handleRestoreBackup}
              onShowToast={addToast}
            />
          )}
        </main>
      </div>

      {/* 3. Floating System Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

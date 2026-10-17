'use client';

import React, { useState } from 'react';
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
  AuditLog
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

export default function AegisPanelApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLockdown, setIsLockdown] = useState(false);

  // Dynamic state for demo interactivity
  const [modules, setModules] = useState<FirewallModule[]>(INITIAL_FIREWALL_MODULES);
  const [autoBanList, setAutoBanList] = useState<AutoBanEntry[]>(INITIAL_AUTOBAN_LIST);
  const [cidrRules, setCidrRules] = useState<CidrRule[]>(INITIAL_CIDR_RULES);
  const [leases, setLeases] = useState<DhcpLease[]>(INITIAL_DHCP_LEASES);
  const [pppoeProfiles, setPppoeProfiles] = useState<PppoeProfile[]>(ISP_PRESETS);
  const [natRules, setNatRules] = useState<NatRule[]>(INITIAL_NAT_RULES);
  const [connections, setConnections] = useState<FirewallConnection[]>(INITIAL_FIREWALL_CONNECTIONS);
  const [dnsServices, setDnsServices] = useState<BlockedService[]>(INITIAL_BLOCKED_SERVICES);
  const [backups, setBackups] = useState<BackupItem[]>(BACKUP_ITEMS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  const addToast = (type: 'success' | 'warning' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Toggle Firewall Module (DROP -> MONITOR -> OFF -> DROP)
  const handleToggleModule = (id: string) => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextMode: 'DROP' | 'OFF' | 'MONITOR' =
            m.mode === 'DROP' ? 'MONITOR' : m.mode === 'MONITOR' ? 'OFF' : 'DROP';
          const nextStatus = nextMode === 'DROP' ? 'ACTIVE' : nextMode === 'MONITOR' ? 'STANDBY' : 'DISABLED';

          addToast(
            nextMode === 'DROP' ? 'success' : 'warning',
            `[XDP eBPF] Module "${m.name}" chuyển sang chế độ: ${nextMode}`
          );

          // Add to audit log
          setAuditLogs((logs) => [
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
              operator: 'minhmcpc@aegis',
              action: 'XDP_MODULE_CHANGE',
              target: m.id,
              severity: nextMode === 'DROP' ? 'INFO' : 'WARN',
              details: `Set module mode to ${nextMode}`,
            },
            ...logs,
          ]);

          return { ...m, mode: nextMode, status: nextStatus };
        }
        return m;
      })
    );
  };

  // 2. Unban IP Address
  const handleUnbanIp = (id: string, ip: string) => {
    setAutoBanList((prev) => prev.filter((e) => e.id !== id));
    addToast('success', `Đã xóa IP ${ip} khỏi eBPF LPM Trie Blacklist (Unban thành công)!`);

    setAuditLogs((logs) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
        operator: 'minhmcpc@aegis',
        action: 'AUTOBAN_CLEAR',
        target: ip,
        severity: 'INFO',
        details: 'Manual unban triggered from Web Panel',
      },
      ...logs,
    ]);
  };

  // 3. Add CIDR Rule
  const handleAddCidrRule = (cidr: string, comment: string, action: 'ALLOW' | 'DROP') => {
    const newRule: CidrRule = {
      id: `cidr-${Date.now()}`,
      cidr,
      comment,
      action,
      hits: 0,
      added: new Date().toISOString().split('T')[0],
    };
    setCidrRules((prev) => [...prev, newRule]);
    addToast('success', `Đã ghi quy tắc CIDR ${cidr} [${action}] vào Kernel eBPF Map!`);
  };

  // 4. Toggle FastTrack per DHCP Lease
  const handleToggleFastTrack = (leaseId: string) => {
    setLeases((prev) =>
      prev.map((l) => {
        if (l.id === leaseId) {
          const nextState = !l.fastTrack;
          addToast(
            'info',
            `RouterOS FastTrack L3: ${nextState ? 'BẬT' : 'TẮT'} cho thiết bị ${l.hostname} (${l.ip})`
          );
          return { ...l, fastTrack: nextState };
        }
        return l;
      })
    );
  };

  // 5. Switch Active ISP Route
  const handleSwitchIsp = (ispId: string) => {
    const target = pppoeProfiles.find((p) => p.id === ispId);
    if (target) {
      addToast('success', `Chuyển mạch định tuyến Default Route thành công sang: ${target.name} (VLAN ${target.vlanId})`);
    }
  };

  // 5.1. Add PPPoE Connection Profile
  const handleAddPppoe = (profileData: Omit<PppoeProfile, 'id'>) => {
    const newProfile: PppoeProfile = {
      ...profileData,
      id: `ppp-${Date.now()}`,
      status: profileData.status || 'CONNECTED',
      uptime: '0s',
      ipAddress: profileData.ipAddress || `118.69.150.${Math.floor(Math.random() * 200 + 10)}`,
      gateway: profileData.gateway || '118.69.150.1'
    };
    setPppoeProfiles((prev) => [...prev, newProfile]);
    addToast('success', `Đã thêm cấu hình PPPoE: ${newProfile.name} (VLAN ${newProfile.vlanId})`);
    setAuditLogs((logs) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
        operator: 'minhmcpc@aegis',
        action: 'PPPOE_ADD',
        target: newProfile.name,
        severity: 'INFO',
        details: `Added PPPoE profile on ${newProfile.iface} with VLAN ${newProfile.vlanId}`,
      },
      ...logs,
    ]);
  };

  // 5.2. Edit PPPoE Connection Profile
  const handleEditPppoe = (profile: PppoeProfile) => {
    setPppoeProfiles((prev) => prev.map((p) => p.id === profile.id ? profile : p));
    addToast('info', `Đã cập nhật thông số kết nối PPPoE: ${profile.name}`);
    setAuditLogs((logs) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
        operator: 'minhmcpc@aegis',
        action: 'PPPOE_UPDATE',
        target: profile.name,
        severity: 'INFO',
        details: `Updated PPPoE configuration for ${profile.username}`,
      },
      ...logs,
    ]);
  };

  // 5.3. Delete PPPoE Connection Profile
  const handleDeletePppoe = (id: string) => {
    const target = pppoeProfiles.find((p) => p.id === id);
    setPppoeProfiles((prev) => prev.filter((p) => p.id !== id));
    addToast('warning', `Đã gỡ bỏ kết nối PPPoE: ${target?.name || id}`);
    setAuditLogs((logs) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
        operator: 'minhmcpc@aegis',
        action: 'PPPOE_DELETE',
        target: target?.name || id,
        severity: 'WARN',
        details: `Removed PPPoE interface from RouterOS configuration`,
      },
      ...logs,
    ]);
  };

  // 5.4. Add NAT Port Rule
  const handleAddNatRule = (ruleData: Omit<NatRule, 'id' | 'packets'>) => {
    const newId = natRules.length > 0 ? Math.max(...natRules.map((r) => r.id)) + 1 : 0;
    const newRule: NatRule = {
      ...ruleData,
      id: newId,
      packets: 0,
      enabled: true
    };
    setNatRules((prev) => [...prev, newRule]);
    addToast('success', `Đã thêm quy tắc NAT Port: ${newRule.dstPort} -> ${newRule.toAddress}:${newRule.toPort}`);
    setAuditLogs((logs) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
        operator: 'minhmcpc@aegis',
        action: 'NAT_PORT_ADD',
        target: `dstnat-${newRule.dstPort}`,
        severity: 'INFO',
        details: `Forward port ${newRule.dstPort} (${newRule.proto.toUpperCase()}) to ${newRule.toAddress}:${newRule.toPort}`,
      },
      ...logs,
    ]);
  };

  // 5.5. Edit NAT Port Rule
  const handleEditNatRule = (rule: NatRule) => {
    setNatRules((prev) => prev.map((r) => r.id === rule.id ? rule : r));
    addToast('info', `Đã cập nhật quy tắc NAT Port #${rule.id}`);
  };

  // 5.6. Delete NAT Port Rule
  const handleDeleteNatRule = (id: number) => {
    const target = natRules.find((r) => r.id === id);
    setNatRules((prev) => prev.filter((r) => r.id !== id));
    addToast('warning', `Đã xóa quy tắc NAT Port #${id} (${target?.comment || ''})`);
  };

  // 5.7. Toggle Enable/Disable NAT Port Rule
  const handleToggleNatRule = (id: number) => {
    setNatRules((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextState = r.enabled !== false ? false : true;
          addToast(nextState ? 'success' : 'warning', `Quy tắc NAT Port #${id}: ${nextState ? 'BẬT' : 'TẮT'}`);
          return { ...r, enabled: nextState };
        }
        return r;
      })
    );
  };

  // 5.8. Kill / Drop Active Connection (Conntrack)
  const handleKillConnection = (connId: string) => {
    const target = connections.find((c) => c.id === connId);
    setConnections((prev) => prev.filter((c) => c.id !== connId));
    addToast('warning', `Đã đóng phiên kết nối (Drop Conntrack): ${target?.srcAddress}:${target?.srcPort || ''} -> ${target?.dstAddress}:${target?.dstPort || ''}`);
    setAuditLogs((logs) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
        operator: 'minhmcpc@aegis',
        action: 'CONNTRACK_KILL',
        target: target?.id || connId,
        severity: 'WARN',
        details: `Dropped active connection ${target?.srcAddress} -> ${target?.dstAddress} (${target?.protocol?.toUpperCase()})`,
      },
      ...logs,
    ]);
  };

  // 6. Toggle DNS Blocked Service (AdGuard)
  const handleToggleService = (id: string) => {
    setDnsServices((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextBlocked = !s.blocked;
          addToast(
            nextBlocked ? 'warning' : 'success',
            `AdGuard Home: ${nextBlocked ? 'ĐÃ CHẶN' : 'ĐÃ MỞ KHÓA'} dịch vụ "${s.name}"!`
          );

          setAuditLogs((logs) => [
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
              operator: 'minhmcpc@aegis',
              action: nextBlocked ? 'DNS_SERVICE_BLOCK' : 'DNS_SERVICE_UNBLOCK',
              target: s.id,
              severity: 'INFO',
              details: `${nextBlocked ? 'Blocked' : 'Unblocked'} ${s.name} in AdGuard Home config`,
            },
            ...logs,
          ]);

          return { ...s, blocked: nextBlocked };
        }
        return s;
      })
    );
  };

  // 7. Create Cluster Backup
  const handleCreateBackup = () => {
    const now = new Date();
    const dateStr = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const newBackup: BackupItem = {
      id: `bk-${Date.now()}`,
      filename: `aegis-cluster-snapshot-${dateStr}.backup`,
      target: 'MikroTik RouterOS',
      size: '2.8 MB',
      created: now.toLocaleString('vi-VN'),
      hash: 'f9a2...410c',
    };
    setBackups((prev) => [newBackup, ...prev]);
    addToast('success', `Đã tạo bản sao lưu cụm toàn diện: ${newBackup.filename}`);
  };

  // 8. Restore Backup
  const handleRestoreBackup = (filename: string) => {
    addToast('warning', `Đang áp dụng cấu hình khôi phục từ snapshot: ${filename}...`);
    setTimeout(() => {
      addToast('success', `● Khôi phục hoàn tất! Toàn bộ 4 tầng phòng thủ đã được đồng bộ hóa.`);
    }, 1000);
  };

  // 9. Manual Telemetry Refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    addToast('info', 'Đang đồng bộ lại chỉ số viễn trắc từ XDP Kernel, RouterOS REST API và AdGuard Home...');
    setTimeout(() => {
      setIsRefreshing(false);
      addToast('success', '● Toàn bộ dữ liệu viễn trắc đã được nạp mới thành công!');
    }, 700);
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
        blockedDnsRate={DNS_STATS.blockedPercent}
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
              stats={DNS_STATS}
              services={dnsServices}
              queryLog={INITIAL_QUERY_LOG}
              rewrites={DNS_REWRITES}
              onToggleService={handleToggleService}
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

import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/server-store';
import { fetchAegisApi } from '@/lib/adapters';

interface RemoteTelemetry {
  throughputMbps: number;
  pps: number;
  totalDrops: number;
  activeSessions: number;
  lockdown: boolean;
  updatedAt: string;
  firewallActiveCount?: number;
  autoBansCount?: number;
  dnsQueriesTotal?: number;
  dnsBlockedRate?: number;
  activeDhcpClients?: number;
  openPortsCount?: number;
}

// GET /api/telemetry/live - Đo lường chỉ số viễn trắc lưu lượng và tấn công theo thời gian thực
export async function GET() {
  const remote = await fetchAegisApi<{ success: boolean; telemetry?: RemoteTelemetry; data?: RemoteTelemetry }>('/api/v1/telemetry/live');
  const t = remote?.telemetry || remote?.data;
  if (remote?.success && t) {
    return NextResponse.json({
      success: true,
      data: {
        throughputMbps: t.throughputMbps ?? 0,
        pps: t.pps ?? 0,
        totalDrops: t.totalDrops ?? 0,
        activeSessions: t.activeSessions ?? serverStore.connections.length,
        lockdown: t.lockdown ?? false,
        updatedAt: t.updatedAt ?? new Date().toISOString(),
        firewallActiveCount: t.firewallActiveCount ?? serverStore.modules.filter((m) => m.mode === 'DROP').length,
        autoBansCount: t.autoBansCount ?? serverStore.autoBanList.length,
        dnsQueriesTotal: t.dnsQueriesTotal ?? serverStore.dnsStats.queriesTotal,
        dnsBlockedRate: t.dnsBlockedRate ?? serverStore.dnsStats.blockedPercent,
        activeDhcpClients: t.activeDhcpClients ?? serverStore.leases.length,
        openPortsCount: t.openPortsCount ?? serverStore.ports.filter((p) => p.status === 'UP').length
      },
      source: 'AEGIS_API_URL',
      timestamp: new Date().toISOString()
    });
  }

  const telemetry = serverStore.updateTelemetry();

  return NextResponse.json({
    success: true,
    data: {
      ...telemetry,
      firewallActiveCount: serverStore.modules.filter((m) => m.mode === 'DROP').length,
      autoBansCount: serverStore.autoBanList.length,
      dnsQueriesTotal: serverStore.dnsStats.queriesTotal,
      dnsBlockedRate: serverStore.dnsStats.blockedPercent,
      activeDhcpClients: serverStore.leases.length,
      openPortsCount: serverStore.ports.filter((p) => p.status === 'UP').length
    },
    source: 'SERVER_STORE_ADAPTIVE',
    timestamp: new Date().toISOString()
  });
}

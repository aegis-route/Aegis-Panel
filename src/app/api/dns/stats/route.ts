import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/server-store';
import { fetchAegisApi } from '@/lib/adapters';
import { DnsStats } from '@/types';

// GET /api/dns/stats - Lấy chỉ số thống kê AdGuard Home DNS Engine
export async function GET() {
  const remote = await fetchAegisApi<{ success: boolean; data: DnsStats }>('/api/v1/dns/stats');
  if (remote?.success && remote.data) {
    serverStore.dnsStats = remote.data;
    return NextResponse.json({
      success: true,
      data: remote.data,
      source: 'AEGIS_API_URL',
      timestamp: new Date().toISOString()
    });
  }

  return NextResponse.json({
    success: true,
    data: serverStore.dnsStats,
    source: 'SERVER_STORE_ADAPTIVE',
    timestamp: new Date().toISOString()
  });
}

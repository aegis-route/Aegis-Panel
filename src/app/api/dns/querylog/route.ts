import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/server-store';
import { fetchAegisApi } from '@/lib/adapters';
import { DnsQueryLog } from '@/types';

// GET /api/dns/querylog - Lấy danh sách DNS Query Log thời gian thực
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get('filter'); // 'ALL' | 'BLOCKED' | 'RESOLVED'
  const limit = searchParams.get('limit') || '50';

  const queryUrl = `/api/v1/dns/querylog?limit=${limit}${filter && filter !== 'ALL' ? `&filter=${filter}` : ''}`;
  const remote = await fetchAegisApi<{ success: boolean; data: DnsQueryLog[]; total: number }>(queryUrl);

  if (remote?.success && Array.isArray(remote.data)) {
    serverStore.queryLogs = remote.data;
    return NextResponse.json({
      success: true,
      data: remote.data,
      total: remote.data.length,
      source: 'ADGUARD_HOME_LIVE',
      timestamp: new Date().toISOString()
    });
  }

  let logs = serverStore.queryLogs;
  if (filter === 'BLOCKED') {
    logs = logs.filter((l) => l.status === 'BLOCKED');
  } else if (filter === 'RESOLVED') {
    logs = logs.filter((l) => l.status === 'RESOLVED');
  }

  return NextResponse.json({
    success: true,
    data: logs,
    total: logs.length,
    source: 'SERVER_STORE_ADAPTIVE',
    timestamp: new Date().toISOString()
  });
}

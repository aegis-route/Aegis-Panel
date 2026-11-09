import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/server-store';
import { fetchAegisApi } from '@/lib/adapters';
import { DhcpLease } from '@/types';

// GET /api/router/leases - Lấy danh sách DHCP Client Leases
export async function GET() {
  const remote = await fetchAegisApi<{ success: boolean; data: DhcpLease[] }>('/api/v1/router/leases');
  if (remote?.success && remote.data) {
    serverStore.leases = remote.data;
    return NextResponse.json({
      success: true,
      data: remote.data,
      total: remote.data.length,
      source: 'AEGIS_API_URL',
      timestamp: new Date().toISOString()
    });
  }

  return NextResponse.json({
    success: true,
    data: serverStore.leases,
    total: serverStore.leases.length,
    source: 'SERVER_STORE_ADAPTIVE',
    timestamp: new Date().toISOString()
  });
}

// POST /api/router/leases - Cập nhật trạng thái FastTrack hoặc cấu hình Lease
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, action, fastTrack } = body;

    const leaseIndex = serverStore.leases.findIndex((l) => l.id === id);
    if (leaseIndex === -1) {
      return NextResponse.json({ success: false, error: 'DHCP lease not found' }, { status: 404 });
    }

    const currentLease = serverStore.leases[leaseIndex];

    if (action === 'toggle-fasttrack') {
      const nextFastTrack = typeof fastTrack === 'boolean' ? fastTrack : !currentLease.fastTrack;

      // Sync to Aegis-API
      const remote = await fetchAegisApi<{ success: boolean; lease: DhcpLease }>(`/api/v1/router/leases/${id}/fasttrack`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled: nextFastTrack })
      });

      serverStore.leases[leaseIndex] = remote?.lease || {
        ...currentLease,
        fastTrack: nextFastTrack
      };

      serverStore.addAuditLog(
        'ROUTER_FASTTRACK_TOGGLE',
        currentLease.ip,
        'INFO',
        `Set FastTrack to ${nextFastTrack} for ${currentLease.hostname} (${currentLease.ip})`
      );

      return NextResponse.json({
        success: true,
        message: `Đã cập nhật FastTrack cho ${currentLease.hostname}`,
        lease: serverStore.leases[leaseIndex]
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}

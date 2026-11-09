import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/server-store';
import { fetchAegisApi } from '@/lib/adapters';
import { FirewallConnection } from '@/types';

// GET /api/router/connections - Lấy danh sách kết nối hoạt động (Conntrack)
export async function GET() {
  const remote = await fetchAegisApi<{ success: boolean; data: FirewallConnection[] }>('/api/v1/router/connections');
  if (remote?.success && remote.data) {
    serverStore.connections = remote.data;
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
    data: serverStore.connections,
    total: serverStore.connections.length,
    source: 'SERVER_STORE_ADAPTIVE',
    timestamp: new Date().toISOString()
  });
}

// POST /api/router/connections - Ngắt kết nối (Kill Conntrack Session)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    // Sync kill to Aegis-API
    await fetchAegisApi(`/api/v1/router/connections/${id}`, {
      method: 'DELETE'
    });

    const target = serverStore.connections.find((c) => c.id === id);
    if (!target) {
      return NextResponse.json({ success: false, error: 'Connection not found' }, { status: 404 });
    }

    serverStore.connections = serverStore.connections.filter((c) => c.id !== id);

    serverStore.addAuditLog(
      'CONNTRACK_KILL',
      target.id,
      'WARN',
      `Dropped active connection ${target.srcAddress}:${target.srcPort || ''} -> ${target.dstAddress}:${target.dstPort || ''} (${target.protocol.toUpperCase()})`
    );

    return NextResponse.json({
      success: true,
      message: `Đã đóng phiên kết nối: ${target.srcAddress} -> ${target.dstAddress}`,
      remainingCount: serverStore.connections.length
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}

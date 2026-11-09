import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/server-store';
import { fetchAegisApi } from '@/lib/adapters';
import { AutoBanEntry } from '@/types';

// GET /api/firewall/bans - Lấy danh sách Auto-Banned IPs
export async function GET() {
  const remote = await fetchAegisApi<{ success: boolean; data: AutoBanEntry[] }>('/api/v1/firewall/bans');
  if (remote?.success && remote.data) {
    serverStore.autoBanList = remote.data;
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
    data: serverStore.autoBanList,
    total: serverStore.autoBanList.length,
    source: 'SERVER_STORE_ADAPTIVE',
    timestamp: new Date().toISOString()
  });
}

// POST /api/firewall/bans - Gỡ ban một IP khỏi eBPF LPM Trie Map
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, ip } = body;

    // Sync deletion to Aegis-API
    await fetchAegisApi(`/api/v1/firewall/bans?${id ? `id=${encodeURIComponent(id)}` : `ip=${encodeURIComponent(ip)}`}`, {
      method: 'DELETE'
    });

    const initialLength = serverStore.autoBanList.length;
    serverStore.autoBanList = serverStore.autoBanList.filter(
      (entry) => (id ? entry.id !== id : entry.ip !== ip)
    );

    if (serverStore.autoBanList.length === initialLength) {
      return NextResponse.json({ success: false, error: 'IP not found in ban list' }, { status: 404 });
    }

    serverStore.addAuditLog(
      'AUTOBAN_CLEAR',
      ip || id,
      'INFO',
      `Manual unban triggered from Web Panel for IP ${ip || id}`
    );

    return NextResponse.json({
      success: true,
      message: `Đã mở khóa IP ${ip || id} thành công`,
      remainingCount: serverStore.autoBanList.length
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}

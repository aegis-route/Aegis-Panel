import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/server-store';
import { fetchAegisApi } from '@/lib/adapters';
import { BlockedService } from '@/types';

// GET /api/dns/services - Lấy danh sách 11 nhóm ứng dụng kiểm soát
export async function GET() {
  const remote = await fetchAegisApi<{ success: boolean; data: BlockedService[]; blockedCount: number }>('/api/v1/dns/services');
  if (remote?.success && remote.data) {
    serverStore.dnsServices = remote.data;
    return NextResponse.json({
      success: true,
      data: remote.data,
      total: remote.data.length,
      blockedCount: remote.blockedCount ?? remote.data.filter((s) => s.blocked).length,
      source: 'AEGIS_API_URL',
      timestamp: new Date().toISOString()
    });
  }

  return NextResponse.json({
    success: true,
    data: serverStore.dnsServices,
    total: serverStore.dnsServices.length,
    blockedCount: serverStore.dnsServices.filter((s) => s.blocked).length,
    source: 'SERVER_STORE_ADAPTIVE',
    timestamp: new Date().toISOString()
  });
}

// POST /api/dns/services - Bật/tắt chặn một dịch vụ (AdGuard Blocked Services)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, blocked } = body;

    const serviceIndex = serverStore.dnsServices.findIndex((s) => s.id === id);
    if (serviceIndex === -1) {
      return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
    }

    const currentService = serverStore.dnsServices[serviceIndex];
    const nextBlocked = typeof blocked === 'boolean' ? blocked : !currentService.blocked;

    // Sync to Aegis-API
    const remote = await fetchAegisApi<{ success: boolean; service: BlockedService }>('/api/v1/dns/services', {
      method: 'POST',
      body: JSON.stringify({ id, blocked: nextBlocked })
    });

    const updatedService = remote?.service || {
      ...currentService,
      blocked: nextBlocked
    };

    serverStore.dnsServices[serviceIndex] = updatedService;

    serverStore.addAuditLog(
      nextBlocked ? 'DNS_SERVICE_BLOCK' : 'DNS_SERVICE_UNBLOCK',
      currentService.id,
      'INFO',
      `${nextBlocked ? 'Blocked' : 'Unblocked'} ${currentService.name} in AdGuard Home config`
    );

    return NextResponse.json({
      success: true,
      message: `AdGuard Home: ${nextBlocked ? 'ĐÃ CHẶN' : 'ĐÃ MỞ KHÓA'} dịch vụ "${currentService.name}"!`,
      service: updatedService
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}

import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/server-store';
import { fetchAegisApi } from '@/lib/adapters';
import { PppoeProfile } from '@/types';

// GET /api/router/pppoe - Lấy danh sách PPPoE Connection Profiles
export async function GET() {
  const remote = await fetchAegisApi<{ success: boolean; data: PppoeProfile[] }>('/api/v1/router/pppoe');
  if (remote?.success && remote.data) {
    serverStore.pppoeProfiles = remote.data;
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
    data: serverStore.pppoeProfiles,
    total: serverStore.pppoeProfiles.length,
    source: 'SERVER_STORE_ADAPTIVE',
    timestamp: new Date().toISOString()
  });
}

// POST /api/router/pppoe - Thêm cấu hình kết nối PPPoE mới
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newProfile: PppoeProfile = {
      ...body,
      id: body.id || `ppp-${Date.now()}`,
      status: body.status || 'CONNECTED',
      uptime: '0s',
      ipAddress: body.ipAddress || `118.69.150.${Math.floor(Math.random() * 200 + 10)}`,
      gateway: body.gateway || '118.69.150.1'
    };

    // Sync to Aegis-API
    const remote = await fetchAegisApi<{ success: boolean; profile: PppoeProfile }>('/api/v1/router/pppoe', {
      method: 'POST',
      body: JSON.stringify(newProfile)
    });

    const saved = remote?.profile || newProfile;
    serverStore.pppoeProfiles.push(saved);

    serverStore.addAuditLog(
      'PPPOE_ADD',
      saved.name,
      'INFO',
      `Added PPPoE profile on ${saved.iface} with VLAN ${saved.vlanId}`
    );

    return NextResponse.json({
      success: true,
      message: `Đã thêm cấu hình PPPoE: ${saved.name}`,
      profile: saved
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}

// PUT /api/router/pppoe - Sửa cấu hình kết nối PPPoE
export async function PUT(req: Request) {
  try {
    const profile: PppoeProfile = await req.json();
    const index = serverStore.pppoeProfiles.findIndex((p) => p.id === profile.id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'PPPoE profile not found' }, { status: 404 });
    }

    // Sync to Aegis-API
    await fetchAegisApi('/api/v1/router/pppoe', {
      method: 'POST',
      body: JSON.stringify(profile)
    });

    serverStore.pppoeProfiles[index] = profile;

    serverStore.addAuditLog(
      'PPPOE_UPDATE',
      profile.name,
      'INFO',
      `Updated PPPoE configuration for ${profile.username}`
    );

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật thông số kết nối PPPoE: ${profile.name}`,
      profile
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}

// DELETE /api/router/pppoe - Xóa cấu hình PPPoE
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing profile ID' }, { status: 400 });
    }

    // Sync to Aegis-API
    await fetchAegisApi(`/api/v1/router/pppoe/${id}`, {
      method: 'DELETE'
    });

    const target = serverStore.pppoeProfiles.find((p) => p.id === id);
    serverStore.pppoeProfiles = serverStore.pppoeProfiles.filter((p) => p.id !== id);

    serverStore.addAuditLog(
      'PPPOE_DELETE',
      target?.name || id,
      'WARN',
      `Removed PPPoE interface from RouterOS configuration`
    );

    return NextResponse.json({
      success: true,
      message: `Đã gỡ bỏ kết nối PPPoE: ${target?.name || id}`
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}

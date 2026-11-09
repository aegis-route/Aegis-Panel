import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/server-store';
import { fetchAegisApi } from '@/lib/adapters';
import { FirewallModule } from '@/types';

// GET /api/firewall/modules - Lấy danh sách 16 module mitigation
export async function GET() {
  const remote = await fetchAegisApi<{ success: boolean; data: FirewallModule[] }>('/api/v1/firewall/modules');
  if (remote?.success && remote.data) {
    serverStore.modules = remote.data;
    return NextResponse.json({
      success: true,
      data: remote.data,
      total: remote.data.length,
      activeCount: remote.data.filter((m) => m.mode === 'DROP').length,
      source: 'AEGIS_API_URL',
      timestamp: new Date().toISOString()
    });
  }

  return NextResponse.json({
    success: true,
    data: serverStore.modules,
    total: serverStore.modules.length,
    activeCount: serverStore.modules.filter((m) => m.mode === 'DROP').length,
    source: 'SERVER_STORE_ADAPTIVE',
    timestamp: new Date().toISOString()
  });
}

// POST /api/firewall/modules - Chuyển đổi mode (DROP | MONITOR | OFF)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, mode } = body;

    const moduleIndex = serverStore.modules.findIndex((m) => m.id === id);
    if (moduleIndex === -1) {
      return NextResponse.json({ success: false, error: 'Module not found' }, { status: 404 });
    }

    const currentModule = serverStore.modules[moduleIndex];
    const newMode: 'DROP' | 'MONITOR' | 'OFF' =
      mode || (currentModule.mode === 'DROP' ? 'MONITOR' : currentModule.mode === 'MONITOR' ? 'OFF' : 'DROP');

    // Sync to remote Aegis-API
    const remote = await fetchAegisApi<{ success: boolean; module: FirewallModule; message: string }>(
      `/api/v1/firewall/modules/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ mode: newMode })
      }
    );

    const updatedModule = remote?.module || {
      ...currentModule,
      mode: newMode,
      status: (newMode === 'DROP' ? 'ACTIVE' : newMode === 'MONITOR' ? 'STANDBY' : 'DISABLED') as 'ACTIVE' | 'STANDBY' | 'DISABLED'
    };

    serverStore.modules[moduleIndex] = updatedModule;
    serverStore.addAuditLog(
      'XDP_MODULE_CHANGE',
      id,
      newMode === 'DROP' ? 'INFO' : 'WARN',
      `Toggled module "${currentModule.name}" to mode ${newMode}`
    );

    return NextResponse.json({
      success: true,
      message: `Đã chuyển đổi trạng thái module ${currentModule.name} sang ${newMode}`,
      module: updatedModule
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}

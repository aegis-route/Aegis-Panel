import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/server-store';
import { fetchAegisApi } from '@/lib/adapters';
import { AuditLog } from '@/types';

// GET /api/system/audit-logs - Lấy danh sách nhật ký kiểm toán hệ thống
export async function GET() {
  const remote = await fetchAegisApi<{ success: boolean; data: AuditLog[] }>('/api/v1/audit/logs');
  if (remote?.success && remote.data) {
    serverStore.auditLogs = remote.data;
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
    data: serverStore.auditLogs,
    total: serverStore.auditLogs.length,
    source: 'SERVER_STORE_ADAPTIVE',
    timestamp: new Date().toISOString()
  });
}

// POST /api/system/audit-logs - Ghi thêm log kiểm toán mới
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, target, severity, details, operator } = body;

    // Sync log to Aegis-API
    await fetchAegisApi('/api/v1/audit/logs', {
      method: 'POST',
      body: JSON.stringify({ action, target, severity, details, operator })
    });

    const log = serverStore.addAuditLog(
      action || 'GENERIC_ACTION',
      target || 'system',
      severity || 'INFO',
      details || '',
      operator || 'admin@aegis'
    );

    return NextResponse.json({
      success: true,
      log
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}

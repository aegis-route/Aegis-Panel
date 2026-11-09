import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/server-store';
import { fetchAegisApi } from '@/lib/adapters';
import { CidrRule } from '@/types';

// GET /api/firewall/rules/cidr - Lấy danh sách CIDR rules
export async function GET() {
  const remote = await fetchAegisApi<{ success: boolean; data: CidrRule[] }>('/api/v1/firewall/cidr');
  if (remote?.success && remote.data) {
    serverStore.cidrRules = remote.data;
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
    data: serverStore.cidrRules,
    total: serverStore.cidrRules.length,
    source: 'SERVER_STORE_ADAPTIVE',
    timestamp: new Date().toISOString()
  });
}

// POST /api/firewall/rules/cidr - Thêm quy tắc CIDR mới vào eBPF Map
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cidr, comment, action } = body;

    if (!cidr || !action) {
      return NextResponse.json({ success: false, error: 'Thiếu tham số CIDR hoặc Action' }, { status: 400 });
    }

    // Sync to Aegis-API
    const remote = await fetchAegisApi<{ success: boolean; rule: CidrRule; message: string }>('/api/v1/firewall/cidr', {
      method: 'POST',
      body: JSON.stringify({ cidr, comment, action })
    });

    const newRule: CidrRule = remote?.rule || {
      id: `cidr-${Date.now()}`,
      cidr,
      comment: comment || 'Added via Aegis-Panel Web UI',
      action: action === 'ALLOW' ? 'ALLOW' : 'DROP',
      hits: 0,
      added: new Date().toISOString().split('T')[0]
    };

    serverStore.cidrRules.push(newRule);
    serverStore.addAuditLog(
      'CIDR_RULE_ADD',
      cidr,
      'INFO',
      `Added CIDR rule ${cidr} [${newRule.action}] to eBPF Map`
    );

    return NextResponse.json({
      success: true,
      message: `Đã ghi quy tắc CIDR ${cidr} [${newRule.action}] vào Kernel eBPF Map`,
      rule: newRule
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}

// DELETE /api/firewall/rules/cidr - Xóa quy tắc CIDR
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing rule ID' }, { status: 400 });
    }

    // Sync to Aegis-API
    await fetchAegisApi(`/api/v1/firewall/cidr/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });

    const initialLen = serverStore.cidrRules.length;
    serverStore.cidrRules = serverStore.cidrRules.filter((r) => r.id !== id);

    if (serverStore.cidrRules.length === initialLen) {
      return NextResponse.json({ success: false, error: 'Rule not found' }, { status: 404 });
    }

    serverStore.addAuditLog('CIDR_RULE_DELETE', id, 'WARN', `Deleted CIDR rule ${id}`);

    return NextResponse.json({
      success: true,
      message: `Đã xóa quy tắc CIDR thành công`
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}

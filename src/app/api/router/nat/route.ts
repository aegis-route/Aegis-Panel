import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/server-store';
import { fetchAegisApi } from '@/lib/adapters';
import { NatRule } from '@/types';

// GET /api/router/nat - Lấy danh sách quy tắc NAT Port Forwarding
export async function GET() {
  const remote = await fetchAegisApi<{ success: boolean; data: NatRule[] }>('/api/v1/router/nat');
  if (remote?.success && remote.data) {
    serverStore.natRules = remote.data;
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
    data: serverStore.natRules,
    total: serverStore.natRules.length,
    source: 'SERVER_STORE_ADAPTIVE',
    timestamp: new Date().toISOString()
  });
}

// POST /api/router/nat - Thêm mới quy tắc NAT Port Forwarding
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check if toggle request
    if (body.action === 'toggle' && typeof body.id === 'number') {
      const ruleIndex = serverStore.natRules.findIndex((r) => r.id === body.id);
      if (ruleIndex === -1) {
        return NextResponse.json({ success: false, error: 'Rule not found' }, { status: 404 });
      }

      // Sync toggle to Aegis-API
      const remote = await fetchAegisApi<{ success: boolean; rule: NatRule }>(`/api/v1/router/nat/${body.id}/toggle`, {
        method: 'PATCH'
      });

      const current = serverStore.natRules[ruleIndex];
      const nextEnabled = remote?.rule?.enabled !== undefined ? remote.rule.enabled : (current.enabled !== false ? false : true);
      serverStore.natRules[ruleIndex] = { ...current, enabled: nextEnabled };

      serverStore.addAuditLog(
        'NAT_RULE_TOGGLE',
        `nat-#${current.id}`,
        'INFO',
        `Toggled NAT rule #${current.id} to ${nextEnabled ? 'ENABLED' : 'DISABLED'}`
      );

      return NextResponse.json({
        success: true,
        message: `Quy tắc NAT Port #${current.id}: ${nextEnabled ? 'BẬT' : 'TẮT'}`,
        rule: serverStore.natRules[ruleIndex]
      });
    }

    // Add new rule
    const remote = await fetchAegisApi<{ success: boolean; rule: NatRule }>('/api/v1/router/nat', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    const newId = serverStore.natRules.length > 0 ? Math.max(...serverStore.natRules.map((r) => r.id)) + 1 : 0;
    const newRule: NatRule = remote?.rule || {
      ...body,
      id: newId,
      packets: 0,
      enabled: true
    };

    serverStore.natRules.push(newRule);

    serverStore.addAuditLog(
      'NAT_PORT_ADD',
      `dstnat-${newRule.dstPort}`,
      'INFO',
      `Forward port ${newRule.dstPort} (${newRule.proto.toUpperCase()}) to ${newRule.toAddress}:${newRule.toPort}`
    );

    return NextResponse.json({
      success: true,
      message: `Đã thêm quy tắc NAT Port: ${newRule.dstPort} -> ${newRule.toAddress}:${newRule.toPort}`,
      rule: newRule
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}

// PUT /api/router/nat - Sửa quy tắc NAT Port Forwarding
export async function PUT(req: Request) {
  try {
    const rule: NatRule = await req.json();
    const index = serverStore.natRules.findIndex((r) => r.id === rule.id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'NAT rule not found' }, { status: 404 });
    }

    await fetchAegisApi(`/api/v1/router/nat/${rule.id}`, {
      method: 'PUT',
      body: JSON.stringify(rule)
    });

    serverStore.natRules[index] = rule;

    serverStore.addAuditLog('NAT_PORT_UPDATE', `nat-#${rule.id}`, 'INFO', `Updated NAT rule #${rule.id}`);

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật quy tắc NAT Port #${rule.id}`,
      rule
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}

// DELETE /api/router/nat - Xóa quy tắc NAT Port Forwarding
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (idParam === null) {
      return NextResponse.json({ success: false, error: 'Missing rule ID' }, { status: 400 });
    }

    const id = parseInt(idParam, 10);
    await fetchAegisApi(`/api/v1/router/nat/${id}`, {
      method: 'DELETE'
    });

    const target = serverStore.natRules.find((r) => r.id === id);
    serverStore.natRules = serverStore.natRules.filter((r) => r.id !== id);

    serverStore.addAuditLog('NAT_PORT_DELETE', `nat-#${id}`, 'WARN', `Deleted NAT rule #${id} (${target?.comment || ''})`);

    return NextResponse.json({
      success: true,
      message: `Đã xóa quy tắc NAT Port #${id}`
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}

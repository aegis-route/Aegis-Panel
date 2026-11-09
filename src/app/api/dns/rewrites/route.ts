import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/server-store';
import { fetchAegisApi } from '@/lib/adapters';
import { DnsRewrite } from '@/types';

// GET /api/dns/rewrites - Lấy danh sách DNS Rewrites nội bộ từ AdGuard
export async function GET() {
  const remote = await fetchAegisApi<{ success: boolean; data: DnsRewrite[]; total: number }>('/api/v1/dns/rewrites');
  if (remote?.success && Array.isArray(remote.data)) {
    serverStore.rewrites = remote.data;
    return NextResponse.json({
      success: true,
      data: remote.data,
      total: remote.data.length,
      source: 'ADGUARD_HOME_LIVE',
      timestamp: new Date().toISOString()
    });
  }

  return NextResponse.json({
    success: true,
    data: serverStore.rewrites,
    total: serverStore.rewrites.length,
    source: 'SERVER_STORE_ADAPTIVE',
    timestamp: new Date().toISOString()
  });
}

// POST /api/dns/rewrites - Thêm mới bản ghi DNS Rewrite vào AdGuard
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { domain, answer, type, description } = body;

    if (!domain || !answer) {
      return NextResponse.json({ success: false, error: 'Thiếu Domain hoặc IP đích' }, { status: 400 });
    }

    const cleanDomain = domain.trim();
    const cleanAnswer = answer.trim();

    // Sync to Aegis-API / AdGuard Home
    const remote = await fetchAegisApi<{ success: boolean; rewrite: DnsRewrite }>('/api/v1/dns/rewrites', {
      method: 'POST',
      body: JSON.stringify({ domain: cleanDomain, answer: cleanAnswer, type, description })
    });

    const newRewrite: DnsRewrite = remote?.rewrite || {
      id: `rw-${Date.now()}`,
      domain: cleanDomain,
      answer: cleanAnswer,
      type: type || 'A',
      description: description || `AdGuard Internal Rewrite (${cleanDomain} -> ${cleanAnswer})`
    };

    serverStore.rewrites = [...serverStore.rewrites.filter((r) => r.domain !== cleanDomain), newRewrite];

    serverStore.addAuditLog(
      'DNS_REWRITE_ADD',
      cleanDomain,
      'INFO',
      `Mapped internal domain ${cleanDomain} -> ${cleanAnswer} in AdGuard Home`
    );

    return NextResponse.json({
      success: true,
      message: `Đã tạo ánh xạ DNS: ${cleanDomain} -> ${cleanAnswer}`,
      rewrite: newRewrite,
      source: remote?.success ? 'ADGUARD_HOME_LIVE' : 'SERVER_STORE_ADAPTIVE'
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}

// DELETE /api/dns/rewrites - Xóa bản ghi DNS Rewrite khỏi AdGuard
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const domain = searchParams.get('domain');

    if (!id && !domain) {
      return NextResponse.json({ success: false, error: 'Missing rewrite ID or domain' }, { status: 400 });
    }

    const targetParam = id || domain;
    await fetchAegisApi(`/api/v1/dns/rewrites?id=${encodeURIComponent(targetParam!)}`, {
      method: 'DELETE'
    });

    const target = serverStore.rewrites.find((r) => r.id === id || r.domain === domain);
    serverStore.rewrites = serverStore.rewrites.filter((r) => r.id !== id && r.domain !== domain);

    serverStore.addAuditLog(
      'DNS_REWRITE_DELETE',
      target?.domain || targetParam!,
      'WARN',
      `Deleted DNS rewrite for ${target?.domain || targetParam}`
    );

    return NextResponse.json({
      success: true,
      message: `Đã xóa bản ghi DNS Rewrite khỏi AdGuard Home`
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}

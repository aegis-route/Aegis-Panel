import { NextResponse } from 'next/server';
import { lookupGeoIp } from '@/lib/adapters';

// GET /api/geoip/[ip] - Tra cứu vị trí địa lý, ASN & cờ rủi ro IP từ Aegis-API service
export async function GET(
  req: Request,
  { params }: { params: Promise<{ ip: string }> }
) {
  try {
    const { ip } = await params;
    if (!ip) {
      return NextResponse.json({ success: false, error: 'Missing IP address' }, { status: 400 });
    }

    const geoData = await lookupGeoIp(ip);

    return NextResponse.json({
      success: true,
      ip,
      data: geoData,
      timestamp: new Date().toISOString()
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lookup failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

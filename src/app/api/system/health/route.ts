import { NextResponse } from 'next/server';
import { checkClusterHealth } from '@/lib/adapters';

// GET /api/system/health - Kiểm tra sức khỏe kết nối đa cụm (4 VMs & API)
export async function GET() {
  const health = await checkClusterHealth();
  return NextResponse.json({
    success: true,
    data: health,
    timestamp: new Date().toISOString()
  });
}

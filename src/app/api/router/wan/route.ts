import { NextResponse } from 'next/server';

// GET /api/router/wan - Lấy trạng thái đường truyền WAN & Router Gateway
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      type: 'PPPoE Client (Dual-WAN Failover)',
      primaryIsp: 'VNPT Telecom GPON',
      backupIsp: 'Viettel Business Direct',
      publicIp: '118.69.150.84',
      gateway: '118.69.150.1',
      vlanId: 35,
      mtu: 1492,
      status: 'CONNECTED',
      uptime: '18d 04h 22m',
      pingGoogleMs: 2.1,
      pingCloudflareMs: 1.4,
      dnsServers: ['192.168.100.2', '1.1.1.1'],
      hardwareModel: 'MikroTik Cloud Hosted Router (CHR) v7.24.5',
      cpuLoad: '4.2%',
      memoryUsed: '248 MB / 1024 MB'
    },
    timestamp: new Date().toISOString()
  });
}

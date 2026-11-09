import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    let bytesReceived = 0;
    if (req.body) {
      const reader = req.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) bytesReceived += value.length;
      }
    } else {
      const arrayBuffer = await req.arrayBuffer();
      bytesReceived = arrayBuffer.byteLength;
    }

    return NextResponse.json(
      {
        success: true,
        bytesReceived,
        timestamp: Date.now()
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store'
        }
      }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: String(err) },
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

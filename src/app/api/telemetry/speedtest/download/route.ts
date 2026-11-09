export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawBytes = parseInt(searchParams.get('bytes') || '10485760', 10);
  const bytes = Math.min(Math.max(rawBytes, 1024), 52428800); // 1KB - 50MB

  const chunkSize = 65536; // 64KB
  const chunk = new Uint8Array(chunkSize);
  chunk.fill(0xaa);

  let sent = 0;
  const stream = new ReadableStream({
    pull(controller) {
      if (sent >= bytes) {
        controller.close();
        return;
      }
      const toSend = Math.min(chunkSize, bytes - sent);
      sent += toSend;
      controller.enqueue(toSend === chunkSize ? chunk : chunk.subarray(0, toSend));
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': bytes.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

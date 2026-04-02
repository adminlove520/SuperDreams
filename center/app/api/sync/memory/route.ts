import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    let agent = null;

    if (authHeader?.startsWith('Bearer ')) {
      // JWT auth
      const { verifyToken } = await import('@/lib/auth');
      const payload = verifyToken(authHeader.slice(7));
      if (payload?.apiKey) agent = await store.verifyApiKey(payload.apiKey);
    } else if (authHeader?.startsWith('ApiKey ')) {
      agent = await store.verifyApiKey(authHeader.slice(7));
    }

    if (!agent) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const memories = Array.isArray(body.memories) ? body.memories : [body];
    const result = await store.syncMemories(agent.id, memories);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('POST /api/sync/memory error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    const apiKey = authHeader?.startsWith('ApiKey ') ? authHeader.slice(7) : null;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }

    const agent = await store.verifyApiKey(apiKey);
    if (!agent || agent.id !== params.id) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 403 });
    }

    await store.heartbeat(params.id);
    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('POST /api/agents/[id]/heartbeat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

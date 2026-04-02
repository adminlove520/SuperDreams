import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const agentId = searchParams.get('agentId') || undefined;
    const type = searchParams.get('type') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 });
    }

    const { results, total } = await store.searchMemories(query, agentId, type, limit);
    return NextResponse.json({ results, total, query });
  } catch (error) {
    console.error('GET /api/search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

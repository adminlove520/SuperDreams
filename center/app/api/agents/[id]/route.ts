import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const detail = await store.getAgentDetail(params.id);
    if (!detail) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }
    return NextResponse.json(detail);
  } catch (error) {
    console.error('GET /api/agents/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await store.deleteAgent(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/agents/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

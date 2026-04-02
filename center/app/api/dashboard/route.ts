import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET() {
  try {
    const data = await store.getDashboard();
    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /api/dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

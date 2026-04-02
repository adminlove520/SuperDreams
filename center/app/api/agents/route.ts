import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { store } from '@/lib/store';
import { generateToken } from '@/lib/auth';

function generateApiKey(): string {
  return 'sk_' + uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '').slice(0, 24);
}

export async function GET() {
  try {
    const agents = await store.getAgents();
    return NextResponse.json({ agents });
  } catch (error) {
    console.error('GET /api/agents error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, species = 'lobster' } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const id = uuidv4();
    const apiKey = generateApiKey();
    const agent = await store.createAgent(id, name, species, apiKey);
    const token = generateToken(id, apiKey);

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        species: agent.species,
        status: agent.status,
        created_at: agent.created_at,
      },
      apiKey,
      token,
    });
  } catch (error) {
    console.error('POST /api/agents error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

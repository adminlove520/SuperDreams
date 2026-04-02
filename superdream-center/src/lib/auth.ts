import jwt from 'jsonwebtoken';
import { getDb } from './db';
import type { Agent } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'super-dreams-secret-key-change-in-production';

export interface AuthPayload {
  agentId: string;
  apiKey: string;
}

export function generateToken(agentId: string): string {
  return jwt.sign({ agentId }, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function verifyApiKey(apiKey: string): Agent | null {
  const db = getDb();
  const agent = db.prepare('SELECT * FROM agents WHERE api_key = ?').get(apiKey) as Agent | undefined;
  return agent || null;
}

export function extractToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}

export function createAuthMiddleware() {
  return async (req: Request): Promise<Agent | null> => {
    const authHeader = req.headers.get('Authorization');
    const token = extractToken(authHeader);
    
    if (!token) return null;
    
    // Try JWT first
    const payload = verifyToken(token);
    if (payload) {
      return verifyApiKey(payload.apiKey);
    }
    
    // Fallback to API key
    const apiKey = authHeader?.startsWith('ApiKey ') ? authHeader.slice(7) : token;
    return verifyApiKey(apiKey);
  };
}

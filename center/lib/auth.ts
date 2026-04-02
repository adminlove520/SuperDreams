import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-dreams-secret-key-change-in-production';

export interface AuthPayload {
  agentId: string;
  apiKey: string;
}

export function generateToken(agentId: string, apiKey: string): string {
  return jwt.sign({ agentId, apiKey }, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

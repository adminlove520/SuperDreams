/**
 * Unified Data Store for SuperDreams Center
 * 
 * Auto-detects environment:
 * - If KV_REST_API_URL is set → Vercel KV (production/Vercel)
 * - Otherwise → better-sqlite3 (local development)
 * 
 * All API routes import from this file instead of db.ts directly.
 */

import type { Agent, MemoryIndex, DreamIndex } from './db';

// Re-export types
export type { Agent, MemoryIndex, DreamIndex };

export interface StoreStats {
  total_agents: number;
  online_agents: number;
  total_memories: number;
  total_dreams: number;
  avg_importance: number | null;
}

export interface SyncLogEntry {
  id: number | string;
  agent_id: string;
  agent_name?: string;
  sync_type: string;
  status: string;
  details: string | null;
  created_at: string;
}

export interface AgentSummary extends Agent {
  memory_count: number;
  dream_count: number;
}

export interface AgentDetailData {
  agent: AgentSummary & { avg_importance: number | null };
  recentMemories: MemoryIndex[];
  recentDreams: DreamIndex[];
}

export interface DashboardData {
  stats: StoreStats;
  memoryByType: { type: string; count: number }[];
  recentActivity: SyncLogEntry[];
  agentsSummary: AgentSummary[];
  dreamsByDay: { date: string; count: number }[];
}

export interface SearchResult extends MemoryIndex {
  agent_name: string;
  agent_species: string;
}

// ==================== Environment Detection ====================
function isKV(): boolean {
  return !!(
    (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) ||
    (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
  );
}

// ==================== KV Store Implementation ====================
// Uses Upstash Redis (previously Vercel KV) with JSON-serialized data
// Key schema (prefix ctr: = center):
//   ctr:agent:{id}             → Agent object
//   ctr:agents:index           → string[] of agent IDs
//   ctr:memory:{id}            → MemoryIndex object  
//   ctr:memories:agent:{agentId} → number[] of memory IDs
//   ctr:memories:counter       → auto-increment counter
//   ctr:dream:{id}             → DreamIndex object
//   ctr:dreams:agent:{agentId} → number[] of dream IDs
//   ctr:dreams:counter         → auto-increment counter
//   ctr:synclog:{id}           → SyncLogEntry object
//   ctr:synclog:all            → number[] of sync log IDs (sorted by time)
//   ctr:synclog:counter        → auto-increment counter

let _redis: any = null;
async function getKV() {
  if (_redis) return _redis;
  const { Redis } = await import('@upstash/redis');
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('Missing Redis/KV environment variables');
  _redis = new Redis({ url, token });
  return _redis;
}

const kvStore = {
  // ---- Dashboard ----
  async getDashboard(): Promise<DashboardData> {
    const kv = await getKV();
    const agentIds: string[] = (await kv.get('agents:index')) || [];
    const agents: AgentSummary[] = [];
    let totalMemories = 0, totalDreams = 0, importanceSum = 0, importanceCount = 0;
    const typeMap: Record<string, number> = {};
    const now = Date.now();

    for (const id of agentIds) {
      const agent = await kv.get<Agent>(`agent:${id}`);
      if (!agent) continue;
      const memIds: number[] = (await kv.get(`memories:agent:${id}`)) || [];
      const dreamIds: number[] = (await kv.get(`dreams:agent:${id}`)) || [];
      const isOnline = agent.last_heartbeat && (now - new Date(agent.last_heartbeat).getTime()) < 120000;

      agents.push({ ...agent, status: isOnline ? 'online' : 'offline', memory_count: memIds.length, dream_count: dreamIds.length });
      totalMemories += memIds.length;
      totalDreams += dreamIds.length;

      for (const mid of memIds) {
        const mem = await kv.get<MemoryIndex>(`memory:${mid}`);
        if (mem) {
          typeMap[mem.type] = (typeMap[mem.type] || 0) + 1;
          importanceSum += mem.importance;
          importanceCount++;
        }
      }
    }

    const onlineAgents = agents.filter(a => a.status === 'online').length;
    const memoryByType = Object.entries(typeMap).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count);

    // Recent activity
    const allLogIds: number[] = (await kv.get('synclog:all')) || [];
    const recentLogIds = allLogIds.slice(-10).reverse();
    const recentActivity: SyncLogEntry[] = [];
    for (const lid of recentLogIds) {
      const log = await kv.get<SyncLogEntry>(`synclog:${lid}`);
      if (log) {
        const agent = agents.find(a => a.id === log.agent_id);
        recentActivity.push({ ...log, agent_name: agent?.name || 'Unknown' });
      }
    }

    // Dreams by day (last 7 days)
    const dreamsByDayMap: Record<string, number> = {};
    for (const agent of agents) {
      const dreamIds: number[] = (await kv.get(`dreams:agent:${agent.id}`)) || [];
      for (const did of dreamIds.slice(-50)) {
        const dream = await kv.get<DreamIndex>(`dream:${did}`);
        if (dream?.dreamed_at) {
          const date = dream.dreamed_at.slice(0, 10);
          dreamsByDayMap[date] = (dreamsByDayMap[date] || 0) + 1;
        }
      }
    }
    const dreamsByDay = Object.entries(dreamsByDayMap).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)).slice(-7);

    return {
      stats: {
        total_agents: agents.length,
        online_agents: onlineAgents,
        total_memories: totalMemories,
        total_dreams: totalDreams,
        avg_importance: importanceCount > 0 ? importanceSum / importanceCount : null,
      },
      memoryByType,
      recentActivity,
      agentsSummary: agents.sort((a, b) => (b.last_heartbeat || '').localeCompare(a.last_heartbeat || '')),
      dreamsByDay,
    };
  },

  // ---- Agents ----
  async getAgents(): Promise<AgentSummary[]> {
    const kv = await getKV();
    const agentIds: string[] = (await kv.get('agents:index')) || [];
    const agents: AgentSummary[] = [];
    for (const id of agentIds) {
      const agent = await kv.get<Agent>(`agent:${id}`);
      if (!agent) continue;
      const memIds: number[] = (await kv.get(`memories:agent:${id}`)) || [];
      const dreamIds: number[] = (await kv.get(`dreams:agent:${id}`)) || [];
      agents.push({ ...agent, memory_count: memIds.length, dream_count: dreamIds.length });
    }
    return agents;
  },

  async createAgent(id: string, name: string, species: string, apiKey: string): Promise<Agent> {
    const kv = await getKV();
    const now = new Date().toISOString();
    const agent: Agent = { id, name, species, api_key: apiKey, jwt_secret: null, status: 'online', last_heartbeat: now, created_at: now };
    await kv.set(`agent:${id}`, agent);
    const agentIds: string[] = (await kv.get('agents:index')) || [];
    agentIds.push(id);
    await kv.set('agents:index', agentIds);
    return agent;
  },

  async getAgentDetail(id: string): Promise<AgentDetailData | null> {
    const kv = await getKV();
    const agent = await kv.get<Agent>(`agent:${id}`);
    if (!agent) return null;

    const memIds: number[] = (await kv.get(`memories:agent:${id}`)) || [];
    const dreamIds: number[] = (await kv.get(`dreams:agent:${id}`)) || [];

    const recentMemories: MemoryIndex[] = [];
    for (const mid of memIds.slice(-10).reverse()) {
      const mem = await kv.get<MemoryIndex>(`memory:${mid}`);
      if (mem) recentMemories.push(mem);
    }

    const recentDreams: DreamIndex[] = [];
    for (const did of dreamIds.slice(-5).reverse()) {
      const dream = await kv.get<DreamIndex>(`dream:${did}`);
      if (dream) recentDreams.push(dream);
    }

    let importanceSum = 0;
    for (const m of recentMemories) importanceSum += m.importance;
    const avgImportance = recentMemories.length > 0 ? importanceSum / recentMemories.length : null;

    return {
      agent: { ...agent, memory_count: memIds.length, dream_count: dreamIds.length, avg_importance: avgImportance },
      recentMemories,
      recentDreams,
    };
  },

  async deleteAgent(id: string): Promise<void> {
    const kv = await getKV();
    // Delete memories
    const memIds: number[] = (await kv.get(`memories:agent:${id}`)) || [];
    for (const mid of memIds) await kv.del(`memory:${mid}`);
    await kv.del(`memories:agent:${id}`);
    // Delete dreams
    const dreamIds: number[] = (await kv.get(`dreams:agent:${id}`)) || [];
    for (const did of dreamIds) await kv.del(`dream:${did}`);
    await kv.del(`dreams:agent:${id}`);
    // Delete agent
    await kv.del(`agent:${id}`);
    const agentIds: string[] = (await kv.get('agents:index')) || [];
    await kv.set('agents:index', agentIds.filter(a => a !== id));
  },

  async heartbeat(id: string): Promise<boolean> {
    const kv = await getKV();
    const agent = await kv.get<Agent>(`agent:${id}`);
    if (!agent) return false;
    agent.status = 'online';
    agent.last_heartbeat = new Date().toISOString();
    await kv.set(`agent:${id}`, agent);
    return true;
  },

  async verifyApiKey(apiKey: string): Promise<Agent | null> {
    const kv = await getKV();
    const agentIds: string[] = (await kv.get('agents:index')) || [];
    for (const id of agentIds) {
      const agent = await kv.get<Agent>(`agent:${id}`);
      if (agent && agent.api_key === apiKey) {
        agent.status = 'online';
        agent.last_heartbeat = new Date().toISOString();
        await kv.set(`agent:${id}`, agent);
        return agent;
      }
    }
    return null;
  },

  // ---- Sync Memory ----
  async syncMemories(agentId: string, memories: any[]): Promise<{ synced: number; skipped: number }> {
    const kv = await getKV();
    let synced = 0, skipped = 0;
    const existingIds: number[] = (await kv.get(`memories:agent:${agentId}`)) || [];

    // Check existing UUIDs
    const existingUuids = new Set<string>();
    for (const mid of existingIds) {
      const m = await kv.get<MemoryIndex>(`memory:${mid}`);
      if (m) existingUuids.add(m.memory_uuid);
    }

    for (const item of memories) {
      const { digest, type, importance, tags, memoryUuid, contentPreview } = item;
      if (!digest || !type || !memoryUuid) continue;
      if (existingUuids.has(memoryUuid)) { skipped++; continue; }

      const counter: number = ((await kv.get('memories:counter')) || 0) as number;
      const newId = counter + 1;
      await kv.set('memories:counter', newId);

      const mem: MemoryIndex = {
        id: newId, agent_id: agentId, digest, type, importance: importance || 5,
        tags: Array.isArray(tags) ? JSON.stringify(tags) : (tags || null),
        memory_uuid: memoryUuid, content_preview: contentPreview || null,
        created_at: new Date().toISOString(),
      };
      await kv.set(`memory:${newId}`, mem);
      existingIds.push(newId);
      synced++;
    }

    await kv.set(`memories:agent:${agentId}`, existingIds);

    if (synced > 0) {
      await kvStore._addSyncLog(agentId, 'memory', JSON.stringify({ count: synced, skipped }));
    }
    return { synced, skipped };
  },

  // ---- Sync Dream ----
  async syncDreams(agentId: string, dreams: any[]): Promise<{ synced: number }> {
    const kv = await getKV();
    let synced = 0;
    const existingIds: number[] = (await kv.get(`dreams:agent:${agentId}`)) || [];

    for (const item of dreams) {
      const { summary, status, memoriesCreated, dreamUuid, healthScore } = item;
      const counter: number = ((await kv.get('dreams:counter')) || 0) as number;
      const newId = counter + 1;
      await kv.set('dreams:counter', newId);

      const dream: DreamIndex = {
        id: newId, agent_id: agentId, summary: summary || null,
        status: status || 'completed', memories_created: memoriesCreated || 0,
        dream_uuid: dreamUuid || null, health_score: healthScore || null,
        dreamed_at: new Date().toISOString(),
      };
      await kv.set(`dream:${newId}`, dream);
      existingIds.push(newId);
      synced++;
    }

    await kv.set(`dreams:agent:${agentId}`, existingIds);

    if (synced > 0) {
      await kvStore._addSyncLog(agentId, 'dream', JSON.stringify({ count: synced }));
    }
    return { synced };
  },

  // ---- Search ----
  async searchMemories(query: string, agentId?: string, type?: string, limit = 20): Promise<{ results: SearchResult[]; total: number }> {
    const kv = await getKV();
    const agentIds: string[] = (await kv.get('agents:index')) || [];
    const results: SearchResult[] = [];
    const q = query.toLowerCase();

    for (const aid of agentIds) {
      if (agentId && aid !== agentId) continue;
      const agent = await kv.get<Agent>(`agent:${aid}`);
      if (!agent) continue;
      const memIds: number[] = (await kv.get(`memories:agent:${aid}`)) || [];
      for (const mid of memIds) {
        const mem = await kv.get<MemoryIndex>(`memory:${mid}`);
        if (!mem) continue;
        if (type && mem.type !== type) continue;
        const searchable = `${mem.digest} ${mem.tags || ''} ${mem.content_preview || ''}`.toLowerCase();
        if (searchable.includes(q)) {
          results.push({ ...mem, agent_name: agent.name, agent_species: agent.species });
        }
      }
    }

    results.sort((a, b) => b.importance - a.importance || (b.created_at || '').localeCompare(a.created_at || ''));
    return { results: results.slice(0, limit), total: results.length };
  },

  // ---- Internal ----
  async _addSyncLog(agentId: string, syncType: string, details: string) {
    const kv = await getKV();
    const counter: number = ((await kv.get('synclog:counter')) || 0) as number;
    const newId = counter + 1;
    await kv.set('synclog:counter', newId);
    const entry: SyncLogEntry = {
      id: newId, agent_id: agentId, sync_type: syncType, status: 'success',
      details, created_at: new Date().toISOString(),
    };
    await kv.set(`synclog:${newId}`, entry);
    const allIds: number[] = (await kv.get('synclog:all')) || [];
    allIds.push(newId);
    // Keep only last 200
    if (allIds.length > 200) allIds.splice(0, allIds.length - 200);
    await kv.set('synclog:all', allIds);
  },
};

// ==================== SQLite Store (delegates to existing db.ts) ====================
const sqliteStore = {
  getDashboard: async (): Promise<DashboardData> => {
    const { getDb } = await import('./db');
    const db = getDb();
    const stats = db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM agents) as total_agents,
        (SELECT COUNT(*) FROM agents WHERE status = 'online') as online_agents,
        (SELECT COUNT(*) FROM memory_index) as total_memories,
        (SELECT COUNT(*) FROM dream_index) as total_dreams,
        (SELECT AVG(importance) FROM memory_index) as avg_importance
    `).get() as any;
    const memoryByType = db.prepare(`SELECT type, COUNT(*) as count FROM memory_index GROUP BY type ORDER BY count DESC`).all() as any[];
    const recentActivity = db.prepare(`SELECT s.*, a.name as agent_name FROM sync_log s JOIN agents a ON s.agent_id = a.id ORDER BY s.created_at DESC LIMIT 10`).all() as any[];
    const agentsSummary = db.prepare(`SELECT a.id, a.name, a.species, a.status, a.last_heartbeat, COUNT(DISTINCT m.id) as memory_count, COUNT(DISTINCT d.id) as dream_count FROM agents a LEFT JOIN memory_index m ON a.id = m.agent_id LEFT JOIN dream_index d ON a.id = d.agent_id GROUP BY a.id ORDER BY a.last_heartbeat DESC`).all() as any[];
    const dreamsByDay = db.prepare(`SELECT date(dreamed_at) as date, COUNT(*) as count FROM dream_index WHERE dreamed_at > datetime('now', '-7 days') GROUP BY date(dreamed_at) ORDER BY date ASC`).all() as any[];
    return { stats, memoryByType, recentActivity, agentsSummary, dreamsByDay };
  },

  getAgents: async (): Promise<AgentSummary[]> => {
    const { getDb } = await import('./db');
    const db = getDb();
    return db.prepare(`SELECT a.*, (SELECT COUNT(*) FROM memory_index WHERE agent_id = a.id) as memory_count, (SELECT COUNT(*) FROM dream_index WHERE agent_id = a.id) as dream_count FROM agents a ORDER BY a.last_heartbeat DESC`).all() as AgentSummary[];
  },

  createAgent: async (id: string, name: string, species: string, apiKey: string): Promise<Agent> => {
    const { getDb } = await import('./db');
    const db = getDb();
    db.prepare(`INSERT INTO agents (id, name, species, api_key, status, last_heartbeat) VALUES (?, ?, ?, ?, 'online', CURRENT_TIMESTAMP)`).run(id, name, species, apiKey);
    return db.prepare('SELECT * FROM agents WHERE id = ?').get(id) as Agent;
  },

  getAgentDetail: async (id: string): Promise<AgentDetailData | null> => {
    const { getDb } = await import('./db');
    const db = getDb();
    const agent = db.prepare(`SELECT a.*, (SELECT COUNT(*) FROM memory_index WHERE agent_id = a.id) as memory_count, (SELECT COUNT(*) FROM dream_index WHERE agent_id = a.id) as dream_count, (SELECT AVG(importance) FROM memory_index WHERE agent_id = a.id) as avg_importance FROM agents a WHERE a.id = ?`).get(id) as any;
    if (!agent) return null;
    const recentMemories = db.prepare(`SELECT * FROM memory_index WHERE agent_id = ? ORDER BY created_at DESC LIMIT 10`).all(id) as MemoryIndex[];
    const recentDreams = db.prepare(`SELECT * FROM dream_index WHERE agent_id = ? ORDER BY dreamed_at DESC LIMIT 5`).all(id) as DreamIndex[];
    return { agent, recentMemories, recentDreams };
  },

  deleteAgent: async (id: string): Promise<void> => {
    const { getDb } = await import('./db');
    const db = getDb();
    db.prepare('DELETE FROM memory_index WHERE agent_id = ?').run(id);
    db.prepare('DELETE FROM dream_index WHERE agent_id = ?').run(id);
    db.prepare('DELETE FROM sync_log WHERE agent_id = ?').run(id);
    db.prepare('DELETE FROM agents WHERE id = ?').run(id);
  },

  heartbeat: async (id: string): Promise<boolean> => {
    const { getDb } = await import('./db');
    const db = getDb();
    const result = db.prepare(`UPDATE agents SET status = 'online', last_heartbeat = CURRENT_TIMESTAMP WHERE id = ?`).run(id);
    db.prepare(`UPDATE agents SET status = 'offline' WHERE last_heartbeat < datetime('now', '-2 minutes')`).run();
    return result.changes > 0;
  },

  verifyApiKey: async (apiKey: string): Promise<Agent | null> => {
    const { getDb } = await import('./db');
    const db = getDb();
    const agent = db.prepare('SELECT * FROM agents WHERE api_key = ?').get(apiKey) as Agent | undefined;
    if (agent) {
      db.prepare('UPDATE agents SET status = "online", last_heartbeat = CURRENT_TIMESTAMP WHERE id = ?').run(agent.id);
    }
    return agent || null;
  },

  syncMemories: async (agentId: string, memories: any[]): Promise<{ synced: number; skipped: number }> => {
    const { getDb } = await import('./db');
    const db = getDb();
    let synced = 0, skipped = 0;
    const checkStmt = db.prepare('SELECT id FROM memory_index WHERE agent_id = ? AND memory_uuid = ?');
    const insertStmt = db.prepare(`INSERT INTO memory_index (agent_id, digest, type, importance, tags, memory_uuid, content_preview) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    const logStmt = db.prepare(`INSERT INTO sync_log (agent_id, sync_type, status, details) VALUES (?, 'memory', 'success', ?)`);
    const transaction = db.transaction((items: any[]) => {
      for (const item of items) {
        const { digest, type, importance, tags, memoryUuid, contentPreview } = item;
        if (!digest || !type || !memoryUuid) continue;
        if (checkStmt.get(agentId, memoryUuid)) { skipped++; continue; }
        insertStmt.run(agentId, digest, type, importance || 5, Array.isArray(tags) ? JSON.stringify(tags) : (tags || null), memoryUuid, contentPreview || null);
        synced++;
      }
    });
    transaction(memories);
    if (synced > 0) logStmt.run(agentId, JSON.stringify({ count: synced, skipped }));
    return { synced, skipped };
  },

  syncDreams: async (agentId: string, dreams: any[]): Promise<{ synced: number }> => {
    const { getDb } = await import('./db');
    const db = getDb();
    let synced = 0;
    const insertStmt = db.prepare(`INSERT INTO dream_index (agent_id, summary, status, memories_created, dream_uuid, health_score) VALUES (?, ?, ?, ?, ?, ?)`);
    const logStmt = db.prepare(`INSERT INTO sync_log (agent_id, sync_type, status, details) VALUES (?, 'dream', 'success', ?)`);
    const transaction = db.transaction((items: any[]) => {
      for (const item of items) {
        const { summary, status, memoriesCreated, dreamUuid, healthScore } = item;
        insertStmt.run(agentId, summary || null, status || 'completed', memoriesCreated || 0, dreamUuid || null, healthScore || null);
        synced++;
      }
    });
    transaction(dreams);
    if (synced > 0) logStmt.run(agentId, JSON.stringify({ count: synced }));
    return { synced };
  },

  searchMemories: async (query: string, agentId?: string, type?: string, limit = 20): Promise<{ results: SearchResult[]; total: number }> => {
    const { getDb } = await import('./db');
    const db = getDb();
    let sql = `SELECT m.*, a.name as agent_name, a.species as agent_species FROM memory_index m JOIN agents a ON m.agent_id = a.id WHERE 1=1`;
    const params: any[] = [];
    const q = `%${query}%`;
    sql += ` AND (m.tags LIKE ? OR m.digest LIKE ? OR m.content_preview LIKE ?)`;
    params.push(q, q, q);
    if (agentId) { sql += ` AND m.agent_id = ?`; params.push(agentId); }
    if (type) { sql += ` AND m.type = ?`; params.push(type); }
    sql += ` ORDER BY m.importance DESC, m.created_at DESC LIMIT ?`;
    params.push(limit);
    const results = db.prepare(sql).all(...params) as SearchResult[];

    let countSql = `SELECT COUNT(*) as total FROM memory_index m WHERE (m.tags LIKE ? OR m.digest LIKE ? OR m.content_preview LIKE ?)`;
    const cParams: any[] = [q, q, q];
    if (agentId) { countSql += ` AND m.agent_id = ?`; cParams.push(agentId); }
    if (type) { countSql += ` AND m.type = ?`; cParams.push(type); }
    const { total } = db.prepare(countSql).get(...cParams) as { total: number };
    return { results, total };
  },
};

// ==================== Exported Store ====================
export const store = isKV() ? kvStore : sqliteStore;

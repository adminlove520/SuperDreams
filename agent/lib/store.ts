/**
 * SuperDreams Agent — 统一存储层
 * 
 * 自动检测环境：
 * - 有 UPSTASH_REDIS_REST_URL (或 KV_REST_API_URL) → Upstash Redis (生产环境持久化)
 * - 否则 → sql.js / SQLite (本地开发)
 * 
 * 所有 API 路由应从此文件导入，而非直接使用 db.ts
 */

import type { Memory, Health, Dream, Stats } from './types'

// ==================== 环境检测 ====================
function isKV(): boolean {
  return !!(
    (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) ||
    (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
  )
}

// ==================== Redis 客户端 ====================
let redisClient: any = null

async function getRedis() {
  if (redisClient) return redisClient
  const { Redis } = await import('@upstash/redis')
  
  // 兼容 Vercel KV 旧环境变量名
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  
  if (!url || !token) throw new Error('Missing Redis/KV environment variables')
  
  redisClient = new Redis({ url, token })
  return redisClient
}

// KV Key Schema (前缀 sd: = SuperDreams):
//   sd:memory:{id}         → Memory JSON
//   sd:memories:ids        → string[] (所有 memory ID，按创建时间倒序)
//   sd:health:{id}         → Health JSON
//   sd:health:ids          → number[] (所有 health ID)
//   sd:health:counter      → number
//   sd:dream:{id}          → Dream JSON
//   sd:dreams:ids          → string[] (所有 dream ID，按时间倒序)
//   sd:synclog:{id}        → SyncLogEntry JSON
//   sd:synclogs:ids        → string[] (所有 sync log ID)

// ==================== KV 实现 ====================

const kvMemoryDb = {
  async getAll(params?: { type?: string; limit?: number; offset?: number; search?: string }): Promise<{ memories: Memory[]; total: number }> {
    const redis = await getRedis()
    const allIds: string[] = (await redis.get('sd:memories:ids')) || []
    
    let memories: Memory[] = []
    if (allIds.length > 0) {
      const pipeline = redis.pipeline()
      for (const id of allIds) pipeline.get(`sd:memory:${id}`)
      const results = await pipeline.exec()
      memories = results.filter(Boolean) as Memory[]
    }

    if (params?.type) {
      memories = memories.filter(m => m.type === params.type)
    }
    if (params?.search) {
      const q = params.search.toLowerCase()
      memories = memories.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        (m.tags || []).some(t => t.toLowerCase().includes(q))
      )
    }

    const total = memories.length
    memories.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    const offset = params?.offset || 0
    const limit = params?.limit || 50
    memories = memories.slice(offset, offset + limit)

    return { memories, total }
  },

  async getById(id: string): Promise<Memory | null> {
    const redis = await getRedis()
    return (await redis.get(`sd:memory:${id}`)) as Memory | null
  },

  async create(memory: Omit<Memory, 'created_at' | 'updated_at'>): Promise<Memory> {
    const redis = await getRedis()
    const now = new Date().toISOString()
    const full: Memory = {
      ...memory,
      tags: memory.tags || [],
      created_at: now,
      updated_at: now,
    } as Memory

    const allIds: string[] = (await redis.get('sd:memories:ids')) || []
    allIds.unshift(memory.id)
    
    const p = redis.pipeline()
    p.set(`sd:memory:${memory.id}`, JSON.stringify(full))
    p.set('sd:memories:ids', JSON.stringify(allIds))
    await p.exec()
    
    return full
  },

  async createMany(memories: Omit<Memory, 'created_at' | 'updated_at'>[]): Promise<number> {
    const redis = await getRedis()
    const now = new Date().toISOString()
    const allIds: string[] = (await redis.get('sd:memories:ids')) || []
    const existingSet = new Set(allIds)
    let count = 0
    const newIds: string[] = []
    const p = redis.pipeline()

    for (const m of memories) {
      if (existingSet.has(m.id)) continue
      const full: Memory = { ...m, tags: m.tags || [], created_at: now, updated_at: now } as Memory
      p.set(`sd:memory:${m.id}`, JSON.stringify(full))
      newIds.push(m.id)
      count++
    }

    if (count > 0) {
      p.set('sd:memories:ids', JSON.stringify([...newIds, ...allIds]))
      await p.exec()
    }
    return count
  },

  async update(id: string, updates: Partial<Memory>): Promise<boolean> {
    const redis = await getRedis()
    const existing = (await redis.get(`sd:memory:${id}`)) as Memory | null
    if (!existing) return false
    const updated = { ...existing, ...updates, updated_at: new Date().toISOString() }
    await redis.set(`sd:memory:${id}`, JSON.stringify(updated))
    return true
  },

  async delete(id: string): Promise<boolean> {
    const redis = await getRedis()
    const allIds: string[] = (await redis.get('sd:memories:ids')) || []
    const idx = allIds.indexOf(id)
    if (idx === -1) return false
    allIds.splice(idx, 1)
    const p = redis.pipeline()
    p.del(`sd:memory:${id}`)
    p.set('sd:memories:ids', JSON.stringify(allIds))
    await p.exec()
    return true
  },

  async stats(): Promise<{ total: number; byType: Record<string, number> }> {
    const redis = await getRedis()
    const allIds: string[] = (await redis.get('sd:memories:ids')) || []
    const byType: Record<string, number> = {}
    if (allIds.length > 0) {
      const p = redis.pipeline()
      for (const id of allIds) p.get(`sd:memory:${id}`)
      const results = await p.exec()
      for (const m of results) {
        if (!m) continue
        const mem = m as Memory
        byType[mem.type] = (byType[mem.type] || 0) + 1
      }
    }
    return { total: allIds.length, byType }
  },

  async existsByName(name: string): Promise<boolean> {
    const { memories } = await kvMemoryDb.getAll({ search: name, limit: 1 })
    return memories.some(m => m.name === name)
  },
}

const kvHealthDb = {
  async getLatest(): Promise<Health | null> {
    const redis = await getRedis()
    const allIds: number[] = (await redis.get('sd:health:ids')) || []
    if (allIds.length === 0) return null
    return (await redis.get(`sd:health:${allIds[allIds.length - 1]}`)) as Health | null
  },

  async getHistory(days: number = 30): Promise<Health[]> {
    const redis = await getRedis()
    const allIds: number[] = (await redis.get('sd:health:ids')) || []
    const recentIds = allIds.slice(-days).reverse()
    if (recentIds.length === 0) return []
    const p = redis.pipeline()
    for (const id of recentIds) p.get(`sd:health:${id}`)
    const results = await p.exec()
    return results.filter(Boolean) as Health[]
  },

  async create(health: Omit<Health, 'id' | 'created_at'>): Promise<void> {
    const redis = await getRedis()
    const counter = (((await redis.get('sd:health:counter')) as number | null) || 0) + 1
    const now = new Date().toISOString()
    const full: Health = { ...health, id: counter, created_at: now }
    const allIds: number[] = (await redis.get('sd:health:ids')) || []
    allIds.push(counter)
    const p = redis.pipeline()
    p.set(`sd:health:${counter}`, JSON.stringify(full))
    p.set('sd:health:ids', JSON.stringify(allIds))
    p.set('sd:health:counter', counter)
    await p.exec()
  },
}

const kvDreamDb = {
  async getAll(limit: number = 20): Promise<Dream[]> {
    const redis = await getRedis()
    const allIds: string[] = (await redis.get('sd:dreams:ids')) || []
    const ids = allIds.slice(0, limit)
    if (ids.length === 0) return []
    const p = redis.pipeline()
    for (const id of ids) p.get(`sd:dream:${id}`)
    const results = await p.exec()
    return results.filter(Boolean) as Dream[]
  },

  async getById(id: string): Promise<Dream | null> {
    const redis = await getRedis()
    return (await redis.get(`sd:dream:${id}`)) as Dream | null
  },

  async create(dream: Omit<Dream, 'completed_at'>): Promise<Dream> {
    const redis = await getRedis()
    const full: Dream = { ...dream, completed_at: null }
    const allIds: string[] = (await redis.get('sd:dreams:ids')) || []
    allIds.unshift(dream.id)
    const p = redis.pipeline()
    p.set(`sd:dream:${dream.id}`, JSON.stringify(full))
    p.set('sd:dreams:ids', JSON.stringify(allIds))
    await p.exec()
    return full
  },

  async complete(id: string, result: { health_score: number; scanned_files: number; new_entries: number; updated_entries: number; report: string }): Promise<void> {
    const redis = await getRedis()
    const dream = (await redis.get(`sd:dream:${id}`)) as Dream | null
    if (!dream) return
    const updated: Dream = {
      ...dream, status: 'completed',
      health_score: result.health_score, scanned_files: result.scanned_files,
      new_entries: result.new_entries, updated_entries: result.updated_entries,
      report: result.report, completed_at: new Date().toISOString(),
    }
    await redis.set(`sd:dream:${id}`, JSON.stringify(updated))
  },

  async fail(id: string, reason: string): Promise<void> {
    const redis = await getRedis()
    const dream = (await redis.get(`sd:dream:${id}`)) as Dream | null
    if (!dream) return
    const updated: Dream = { ...dream, status: 'failed', report: reason, completed_at: new Date().toISOString() }
    await redis.set(`sd:dream:${id}`, JSON.stringify(updated))
  },
}

const kvSyncLogDb = {
  async getAll(limit: number = 20): Promise<{ id: string; type: string; status: string; message: string; timestamp: string }[]> {
    const redis = await getRedis()
    const allIds: string[] = (await redis.get('sd:synclogs:ids')) || []
    const ids = allIds.slice(0, limit)
    if (ids.length === 0) return []
    const p = redis.pipeline()
    for (const id of ids) p.get(`sd:synclog:${id}`)
    const results = await p.exec()
    return results.filter(Boolean) as any[]
  },

  async create(entry: { type: string; status: string; message: string }): Promise<void> {
    const redis = await getRedis()
    const id = `sync_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 4)}`
    const now = new Date().toISOString()
    const full = { id, ...entry, timestamp: now }
    const allIds: string[] = (await redis.get('sd:synclogs:ids')) || []
    allIds.unshift(id)
    if (allIds.length > 200) allIds.length = 200
    const p = redis.pipeline()
    p.set(`sd:synclog:${id}`, JSON.stringify(full))
    p.set('sd:synclogs:ids', JSON.stringify(allIds))
    await p.exec()
  },
}

async function kvGetStats(): Promise<Stats> {
  const redis = await getRedis()
  const memIds: string[] = (await redis.get('sd:memories:ids')) || []
  const dreamIds: string[] = (await redis.get('sd:dreams:ids')) || []
  const health = await kvHealthDb.getLatest()

  let totalTags = 0
  const typeDistribution: Record<string, number> = {}

  if (memIds.length > 0) {
    const p = redis.pipeline()
    for (const id of memIds) p.get(`sd:memory:${id}`)
    const results = await p.exec()
    for (const r of results) {
      if (!r) continue
      const m = r as Memory
      typeDistribution[m.type] = (typeDistribution[m.type] || 0) + 1
      totalTags += (m.tags || []).length
    }
  }

  return {
    memories: memIds.length,
    dreams: dreamIds.length,
    avgHealth: health?.score || 0,
    connections: totalTags,
    typeDistribution,
  }
}

// ==================== SQLite 实现 (委托给 db.ts) ====================

async function getSqliteExports() {
  return await import('./db')
}

const sqliteMemoryDb = {
  async getAll(params?: any) { return (await getSqliteExports()).memoryDb.getAll(params) },
  async getById(id: string) { return (await getSqliteExports()).memoryDb.getById(id) },
  async create(memory: any) { return (await getSqliteExports()).memoryDb.create(memory) },
  async createMany(memories: any) { return (await getSqliteExports()).memoryDb.createMany(memories) },
  async update(id: string, updates: any) { return (await getSqliteExports()).memoryDb.update(id, updates) },
  async delete(id: string) { return (await getSqliteExports()).memoryDb.delete(id) },
  async stats() { return (await getSqliteExports()).memoryDb.stats() },
  async existsByName(name: string) { return (await getSqliteExports()).memoryDb.existsByName(name) },
}

const sqliteHealthDb = {
  async getLatest() { return (await getSqliteExports()).healthDb.getLatest() },
  async getHistory(days?: number) { return (await getSqliteExports()).healthDb.getHistory(days) },
  async create(health: any) { return (await getSqliteExports()).healthDb.create(health) },
}

const sqliteDreamDb = {
  async getAll(limit?: number) { return (await getSqliteExports()).dreamDb.getAll(limit) },
  async getById(id: string) { return (await getSqliteExports()).dreamDb.getById(id) },
  async create(dream: any) { return (await getSqliteExports()).dreamDb.create(dream) },
  async complete(id: string, result: any) { return (await getSqliteExports()).dreamDb.complete(id, result) },
  async fail(id: string, reason: string) { return (await getSqliteExports()).dreamDb.fail(id, reason) },
}

const sqliteSyncLogDb = {
  async getAll(limit?: number) { return (await getSqliteExports()).syncLogDb.getAll(limit) },
  async create(entry: any) { return (await getSqliteExports()).syncLogDb.create(entry) },
}

async function sqliteGetStats(): Promise<Stats> {
  return (await getSqliteExports()).getStats()
}

// ==================== 导出：自动切换 ====================

const useKV = isKV()

export const memoryDb  = useKV ? kvMemoryDb  : sqliteMemoryDb
export const healthDb  = useKV ? kvHealthDb  : sqliteHealthDb
export const dreamDb   = useKV ? kvDreamDb   : sqliteDreamDb
export const syncLogDb = useKV ? kvSyncLogDb : sqliteSyncLogDb
export const getStats  = useKV ? kvGetStats  : sqliteGetStats

console.log(`[SuperDreams Agent] Storage: ${useKV ? 'Upstash Redis (persistent)' : 'SQLite (sql.js)'}`)

import initSqlJs from 'sql.js'
import type { Database as SqlJsDatabase } from 'sql.js'
import path from 'path'
import fs from 'fs'

// ---------- 数据库初始化 ----------
const IS_VERCEL = process.env.VERCEL === '1'
const DB_NAME = 'center.db'

function getDbPath(): string {
  if (IS_VERCEL) {
    const tmpPath = path.join('/tmp', DB_NAME)
    if (!fs.existsSync(tmpPath)) {
      const srcPath = path.join(process.cwd(), 'data', DB_NAME)
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, tmpPath)
      }
    }
    return tmpPath
  }
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  return path.join(dataDir, DB_NAME)
}

let _db: SqlJsDatabase | null = null
let _dbPath: string = ''

function saveDb() {
  if (_db && _dbPath) {
    const data = _db.export()
    const buffer = Buffer.from(data)
    fs.writeFileSync(_dbPath, buffer)
  }
}

export async function getDb(): Promise<SqlJsDatabase> {
  if (_db) return _db

  try {
    const possiblePaths = [
      path.resolve(process.cwd(), 'node_modules/sql.js/dist/sql-wasm.wasm'),
      path.resolve(process.cwd(), 'center/node_modules/sql.js/dist/sql-wasm.wasm'),
      path.join(process.cwd(), '../node_modules/sql.js/dist/sql-wasm.wasm')
    ]
    
    let wasmBinary: Buffer | undefined
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        wasmBinary = fs.readFileSync(p)
        break
      }
    }

    const SQL = await initSqlJs(wasmBinary ? { wasmBinary } as any : undefined)
    _dbPath = getDbPath()

    if (fs.existsSync(_dbPath)) {
      const fileBuffer = fs.readFileSync(_dbPath)
      _db = new SQL.Database(fileBuffer)
    } else {
      _db = new SQL.Database()
    }

    initSchema(_db)
    saveDb()
    return _db
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

function initSchema(db: SqlJsDatabase) {
  db.run(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      species TEXT DEFAULT 'lobster',
      api_key TEXT UNIQUE NOT NULL,
      jwt_secret TEXT,
      status TEXT DEFAULT 'offline',
      last_heartbeat TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS memory_index (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id TEXT NOT NULL,
      digest TEXT NOT NULL,
      type TEXT NOT NULL,
      importance INTEGER DEFAULT 5,
      tags TEXT,
      memory_uuid TEXT NOT NULL,
      content_preview TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (agent_id) REFERENCES agents(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS dream_index (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id TEXT NOT NULL,
      summary TEXT,
      status TEXT DEFAULT 'pending',
      memories_created INTEGER DEFAULT 0,
      dream_uuid TEXT,
      health_score INTEGER,
      dreamed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (agent_id) REFERENCES agents(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sync_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id TEXT NOT NULL,
      sync_type TEXT NOT NULL,
      status TEXT DEFAULT 'success',
      details TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (agent_id) REFERENCES agents(id)
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_memory_agent ON memory_index(agent_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_memory_type ON memory_index(type)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_dream_agent ON dream_index(agent_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_sync_log_agent ON sync_log(agent_id)`);
}

// ---------- 查询辅助函数 ----------
export function queryAll(db: SqlJsDatabase, sql: string, params: any[] = []): any[] {
  const stmt = db.prepare(sql)
  if (params.length) stmt.bind(params)
  const results: any[] = []
  while (stmt.step()) {
    results.push(stmt.getAsObject())
  }
  stmt.free()
  return results
}

export function queryOne(db: SqlJsDatabase, sql: string, params: any[] = []): any | null {
  const stmt = db.prepare(sql)
  if (params.length) stmt.bind(params)
  let result = null
  if (stmt.step()) {
    result = stmt.getAsObject()
  }
  stmt.free()
  return result
}

export function runSql(db: SqlJsDatabase, sql: string, params: any[] = []): number {
  db.run(sql, params)
  saveDb()
  return db.getRowsModified()
}

export interface Agent {
  id: string;
  name: string;
  species: string;
  api_key: string;
  jwt_secret: string | null;
  status: string;
  last_heartbeat: string | null;
  created_at: string;
}

export interface MemoryIndex {
  id: number;
  agent_id: string;
  digest: string;
  type: string;
  importance: number;
  tags: string | null;
  memory_uuid: string;
  content_preview: string | null;
  created_at: string;
}

export interface DreamIndex {
  id: number;
  agent_id: string;
  summary: string | null;
  status: string;
  memories_created: number;
  dream_uuid: string | null;
  health_score: number | null;
  dreamed_at: string;
}

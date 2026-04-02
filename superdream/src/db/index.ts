import Database from 'better-sqlite3';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../data');
const DB_PATH = path.join(DATA_DIR, 'superdream.db');

// 确保 data 目录存在
await fs.mkdir(DATA_DIR, { recursive: true });

// 创建数据库连接
const db = new Database(DB_PATH);

// 启用 WAL 模式
db.pragma('journal_mode = WAL');

// 初始化表结构
const SCHEMA = `
-- 记忆表
CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('lesson', 'decision', 'fact', 'procedure', 'person', 'project')),
  name TEXT NOT NULL,
  summary TEXT DEFAULT '',
  content TEXT DEFAULT '',
  importance INTEGER DEFAULT 5 CHECK(importance >= 1 AND importance <= 10),
  tags TEXT DEFAULT '[]',
  source TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 健康度表
CREATE TABLE IF NOT EXISTS health (
  date TEXT PRIMARY KEY,
  score INTEGER NOT NULL CHECK(score >= 0 AND score <= 100),
  status TEXT NOT NULL CHECK(status IN ('healthy', 'warning', 'critical', 'unknown')),
  dimensions TEXT DEFAULT '{}',
  trend TEXT DEFAULT 'stable',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 做梦记录表
CREATE TABLE IF NOT EXISTS dreams (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('running', 'completed', 'failed')),
  health_score INTEGER DEFAULT 0,
  scanned_files INTEGER DEFAULT 0,
  new_entries INTEGER DEFAULT 0,
  updated_entries INTEGER DEFAULT 0,
  report TEXT DEFAULT '',
  error TEXT DEFAULT '',
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type);
CREATE INDEX IF NOT EXISTS idx_memories_importance ON memories(importance DESC);
CREATE INDEX IF NOT EXISTS idx_memories_created ON memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dreams_date ON dreams(date DESC);
CREATE INDEX IF NOT EXISTS idx_dreams_status ON dreams(status);
`;

db.exec(SCHEMA);

// 类型定义
export type MemoryType = 'lesson' | 'decision' | 'fact' | 'procedure' | 'person' | 'project';
export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown';
export type DreamStatus = 'running' | 'completed' | 'failed';
export type Trend = 'up' | 'down' | 'stable';

export interface Memory {
  id: string;
  type: MemoryType;
  name: string;
  summary: string;
  content: string;
  importance: number;
  tags: string[];
  source: string;
  created_at: string;
  updated_at: string;
}

export interface Health {
  date: string;
  score: number;
  status: HealthStatus;
  dimensions: {
    freshness: number;
    coverage: number;
    coherence: number;
    efficiency: number;
    accessibility: number;
  };
  trend: Trend;
  created_at: string;
}

export interface Dream {
  id: string;
  date: string;
  status: DreamStatus;
  health_score: number;
  scanned_files: number;
  new_entries: number;
  updated_entries: number;
  report: string;
  error: string;
  started_at: string;
  completed_at: string | null;
}

export default db;

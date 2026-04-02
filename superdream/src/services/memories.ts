import { v4 as uuidv4 } from 'uuid';
import db, { Memory } from '../db/index.js';

// ========== 记忆服务 ==========

export const memoryService = {
  // 创建记忆
  create(data: {
    type: Memory['type']
    name: string
    summary?: string
    content?: string
    importance?: number
    tags?: string[]
    source?: string
  }): Memory {
    const id = uuidv4();
    const now = new Date().toISOString();
    const tags = JSON.stringify(data.tags || []);

    const stmt = db.prepare(`
      INSERT INTO memories (id, type, name, summary, content, importance, tags, source, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.type,
      data.name,
      data.summary || '',
      data.content || '',
      data.importance || 5,
      tags,
      data.source || '',
      now,
      now
    );

    return this.getById(id)!;
  },

  // 获取单个记忆
  getById(id: string): Memory | null {
    const stmt = db.prepare('SELECT * FROM memories WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return {
      ...row,
      tags: JSON.parse(row.tags || '[]'),
    };
  },

  // 获取所有记忆（分页）
  getAll(options: {
    type?: Memory['type']
    limit?: number
    offset?: number
    search?: string
  } = {}): { memories: Memory[]; total: number } {
    const { type, limit = 50, offset = 0, search } = options;

    let where = '1=1';
    const params: any[] = [];

    if (type) {
      where += ' AND type = ?';
      params.push(type);
    }

    if (search) {
      where += ' AND (name LIKE ? OR summary LIKE ? OR content LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // 获取总数
    const countStmt = db.prepare(`SELECT COUNT(*) as count FROM memories WHERE ${where}`);
    const { count: total } = countStmt.get(...params) as any;

    // 获取列表
    const stmt = db.prepare(`
      SELECT * FROM memories 
      WHERE ${where}
      ORDER BY importance DESC, created_at DESC
      LIMIT ? OFFSET ?
    `);
    const rows = stmt.all(...params, limit, offset) as any[];

    const memories = rows.map(row => ({
      ...row,
      tags: JSON.parse(row.tags || '[]'),
    }));

    return { memories, total };
  },

  // 更新记忆
  update(id: string, data: Partial<Memory>): Memory | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const tags = data.tags ? JSON.stringify(data.tags) : existing.tags;

    const stmt = db.prepare(`
      UPDATE memories SET
        type = COALESCE(?, type),
        name = COALESCE(?, name),
        summary = COALESCE(?, summary),
        content = COALESCE(?, content),
        importance = COALESCE(?, importance),
        tags = ?,
        updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      data.type,
      data.name,
      data.summary,
      data.content,
      data.importance,
      tags,
      now,
      id
    );

    return this.getById(id);
  },

  // 删除记忆
  delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM memories WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  // 统计
  stats() {
    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN type = 'lesson' THEN 1 ELSE 0 END) as lessons,
        SUM(CASE WHEN type = 'decision' THEN 1 ELSE 0 END) as decisions,
        SUM(CASE WHEN type = 'fact' THEN 1 ELSE 0 END) as facts,
        SUM(CASE WHEN type = 'procedure' THEN 1 ELSE 0 END) as procedures,
        SUM(CASE WHEN type = 'person' THEN 1 ELSE 0 END) as persons,
        SUM(CASE WHEN type = 'project' THEN 1 ELSE 0 END) as projects,
        AVG(importance) as avg_importance
      FROM memories
    `);
    return stmt.get();
  },
};

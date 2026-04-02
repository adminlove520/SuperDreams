import db, { Health } from '../db/index.js';
import { memoryService } from './memories.js';

// ========== 健康度服务 ==========

export const healthService = {
  // 获取最新健康度
  getLatest(): Health | null {
    const stmt = db.prepare('SELECT * FROM health ORDER BY date DESC LIMIT 1');
    const row = stmt.get() as any;
    if (!row) return null;
    return {
      ...row,
      dimensions: JSON.parse(row.dimensions || '{}'),
    };
  },

  // 获取指定日期的健康度
  getByDate(date: string): Health | null {
    const stmt = db.prepare('SELECT * FROM health WHERE date = ?');
    const row = stmt.get(date) as any;
    if (!row) return null;
    return {
      ...row,
      dimensions: JSON.parse(row.dimensions || '{}'),
    };
  },

  // 获取历史健康度
  getHistory(limit = 30): Health[] {
    const stmt = db.prepare(`
      SELECT * FROM health 
      ORDER BY date DESC 
      LIMIT ?
    `);
    const rows = stmt.all(limit) as any[];
    return rows.map(row => ({
      ...row,
      dimensions: JSON.parse(row.dimensions || '{}'),
    }));
  },

  // 计算健康度（基于记忆统计）
  calculateScore(): {
    score: number
    status: Health['status']
    dimensions: Health['dimensions']
  } {
    const stats = memoryService.stats() as any;

    // 基于记忆数量和分布计算分数
    const total = stats.total || 0;
    const avgImportance = stats.avg_importance || 5;

    // 多维度评分
    const freshness = Math.min(100, total * 5); // 记忆越多越新鲜
    const coverage = Math.min(100, (stats.lessons + stats.decisions) * 10);
    const coherence = Math.min(100, avgImportance * 10);
    const efficiency = Math.min(100, total * 2);
    const accessibility = Math.min(100, (stats.facts + stats.procedures) * 15);

    // 综合评分（加权平均）
    const score = Math.round(
      freshness * 0.2 +
      coverage * 0.25 +
      coherence * 0.25 +
      efficiency * 0.15 +
      accessibility * 0.15
    );

    // 确定状态
    let status: Health['status'] = 'unknown';
    if (score >= 70) status = 'healthy';
    else if (score >= 50) status = 'warning';
    else if (score > 0) status = 'critical';

    return {
      score,
      status,
      dimensions: { freshness, coverage, coherence, efficiency, accessibility },
    };
  },

  // 更新健康度
  update(): Health {
    const today = new Date().toISOString().split('T')[0];
    const { score, status, dimensions } = this.calculateScore();

    // 计算趋势（对比昨天）
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const yesterdayHealth = this.getByDate(yesterday);
    let trend: Health['trend'] = 'stable';

    if (yesterdayHealth) {
      if (score > yesterdayHealth.score) trend = 'up';
      else if (score < yesterdayHealth.score) trend = 'down';
    }

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO health (date, score, status, dimensions, trend, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(today, score, status, JSON.stringify(dimensions), trend, new Date().toISOString());

    return this.getByDate(today)!;
  },
};

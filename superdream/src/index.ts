import express from 'express';
import cors from 'cors';
import { memoryService } from './services/memories.js';
import { healthService } from './services/health.js';
import { dreamService } from './services/dream.js';

const app = express();
const PORT = process.env.PORT || 18793;

// 中间件
app.use(cors());
app.use(express.json());

// ========== 健康度 API ==========

app.get('/api/health', (req, res) => {
  try {
    const health = healthService.getLatest();
    res.json(health || {
      score: 0,
      status: 'unknown',
      dimensions: {},
      trend: 'stable',
      date: null,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health/history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 30;
    const history = healthService.getHistory(limit);
    res.json({ history });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========== 记忆 API ==========

app.get('/api/memories', (req, res) => {
  try {
    const type = req.query.type as any;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const search = req.query.search as string;

    const result = memoryService.getAll({ type, limit, offset, search });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/memories/:id', (req, res) => {
  try {
    const memory = memoryService.getById(req.params.id);
    if (!memory) {
      return res.status(404).json({ error: 'Memory not found' });
    }
    res.json(memory);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/memories', (req, res) => {
  try {
    const { type, name, summary, content, importance, tags, source } = req.body;

    if (!type || !name) {
      return res.status(400).json({ error: 'type and name are required' });
    }

    const memory = memoryService.create({
      type,
      name,
      summary,
      content,
      importance,
      tags,
      source,
    });

    res.status(201).json(memory);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/memories/:id', (req, res) => {
  try {
    const memory = memoryService.update(req.params.id, req.body);
    if (!memory) {
      return res.status(404).json({ error: 'Memory not found' });
    }
    res.json(memory);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/memories/:id', (req, res) => {
  try {
    const deleted = memoryService.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Memory not found' });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========== 做梦 API ==========

app.get('/api/dreams', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const dreams = dreamService.getAll(limit);
    res.json({ dreams });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/dreams/:id', (req, res) => {
  try {
    const dream = dreamService.getById(req.params.id);
    if (!dream) {
      return res.status(404).json({ error: 'Dream not found' });
    }
    res.json(dream);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/dreams/trigger', async (req, res) => {
  try {
    // 创建做梦记录
    const dream = dreamService.create();

    // 异步执行（不阻塞响应）
    dreamService.execute(dream.id).catch(console.error);

    res.json({
      id: dream.id,
      status: 'triggered',
      message: '做梦已触发，请稍后查询结果',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========== 统计 API ==========

app.get('/api/stats', (req, res) => {
  try {
    const memoryStats = memoryService.stats() as any;
    const health = healthService.getLatest();
    const dreams = dreamService.getAll(5);

    res.json({
      memories: {
        total: memoryStats.total,
        byType: {
          lesson: memoryStats.lessons,
          decision: memoryStats.decisions,
          fact: memoryStats.facts,
          procedure: memoryStats.procedures,
          person: memoryStats.persons,
          project: memoryStats.projects,
        },
        avgImportance: Math.round(memoryStats.avg_importance || 0),
      },
      health: health ? {
        score: health.score,
        status: health.status,
        trend: health.trend,
      } : null,
      recentDreams: dreams.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========== 启动 ==========

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║     🌙 SuperDreams API 已启动                 ║
║     http://localhost:${PORT}                     ║
╚══════════════════════════════════════════════╝
  `);
});

import { v4 as uuidv4 } from 'uuid';
import db, { Dream, Memory } from '../db/index.js';
import { memoryService } from './memories.js';
import { healthService } from './health.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ========== 做梦服务 ==========

export interface DreamResult {
  scannedFiles: number
  newEntries: Memory[]
  updatedEntries: Memory[]
  report: string
}

export const dreamService = {
  // 获取所有做梦记录
  getAll(limit = 20): Dream[] {
    const stmt = db.prepare(`
      SELECT * FROM dreams 
      ORDER BY started_at DESC 
      LIMIT ?
    `);
    return stmt.all(limit) as Dream[];
  },

  // 获取单个做梦记录
  getById(id: string): Dream | null {
    const stmt = db.prepare('SELECT * FROM dreams WHERE id = ?');
    return stmt.get(id) as Dream | null;
  },

  // 创建新的做梦记录
  create(): Dream {
    const id = uuidv4();
    const date = new Date().toISOString().split('T')[0];

    const stmt = db.prepare(`
      INSERT INTO dreams (id, date, status, started_at)
      VALUES (?, ?, 'running', ?)
    `);

    stmt.run(id, date, new Date().toISOString());

    return this.getById(id)!;
  },

  // 更新做梦记录
  update(id: string, data: Partial<Dream>): void {
    const stmt = db.prepare(`
      UPDATE dreams SET
        status = COALESCE(?, status),
        health_score = COALESCE(?, health_score),
        scanned_files = COALESCE(?, scanned_files),
        new_entries = COALESCE(?, new_entries),
        updated_entries = COALESCE(?, updated_entries),
        report = COALESCE(?, report),
        error = COALESCE(?, error),
        completed_at = COALESCE(?, completed_at)
      WHERE id = ?
    `);

    stmt.run(
      data.status,
      data.health_score,
      data.scanned_files,
      data.new_entries,
      data.updated_entries,
      data.report,
      data.error,
      data.completed_at || null,
      id
    );
  },

  // ========== 核心：执行做梦 ==========

  async execute(dreamId: string): Promise<DreamResult> {
    console.log(`🌙 开始做梦: ${dreamId}`);

    const result: DreamResult = {
      scannedFiles: 0,
      newEntries: [],
      updatedEntries: [],
      report: '',
    };

    try {
      // 1. 扫描日志文件
      const logFiles = await this.scanLogFiles();
      result.scannedFiles = logFiles.length;

      // 2. 分析日志内容，提取记忆
      const extractedMemories = await this.analyzeLogs(logFiles);

      // 3. 保存新记忆
      for (const mem of extractedMemories) {
        const created = memoryService.create(mem);
        result.newEntries.push(created);
      }

      // 4. 更新健康度
      healthService.update();

      // 5. 生成报告
      result.report = this.generateReport(result);

      // 6. 更新做梦记录
      const health = healthService.getLatest();
      this.update(dreamId, {
        status: 'completed',
        health_score: health?.score || 0,
        scanned_files: result.scannedFiles,
        new_entries: result.newEntries.length,
        updated_entries: result.updatedEntries.length,
        report: result.report,
        completed_at: new Date().toISOString(),
      });

      console.log(`✅ 做梦完成: ${result.newEntries.length} 条新记忆`);
    } catch (error: any) {
      console.error(`❌ 做梦失败: ${error.message}`);

      this.update(dreamId, {
        status: 'failed',
        error: error.message,
        completed_at: new Date().toISOString(),
      });

      throw error;
    }

    return result;
  },

  // 扫描日志文件
  async scanLogFiles(): Promise<string[]> {
    const logsDir = path.join(__dirname, '../../../logs');
    const memoryDir = path.join(__dirname, '../../../memory');

    const files: string[] = [];

    // 扫描 logs 目录
    if (fs.existsSync(logsDir)) {
      const logFiles = fs.readdirSync(logsDir)
        .filter(f => f.endsWith('.log'))
        .map(f => path.join(logsDir, f));
      files.push(...logFiles);
    }

    // 扫描 memory 目录（获取最近的日志）
    if (fs.existsSync(memoryDir)) {
      const memoryFiles = fs.readdirSync(memoryDir)
        .filter(f => f.endsWith('.md'))
        .map(f => path.join(memoryDir, f));
      files.push(...memoryFiles);
    }

    // 只返回最近 24 小时修改的文件
    const oneDayAgo = Date.now() - 86400000;
    return files.filter(f => {
      const stat = fs.statSync(f);
      return stat.mtimeMs > oneDayAgo;
    });
  },

  // 分析日志，提取记忆（使用 LLM 或规则）
  async analyzeLogs(files: string[]): Promise<Partial<Memory>[]> {
    const memories: Partial<Memory>[] = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n').filter(l => l.trim());

      // 简单规则提取（可替换为真实 LLM 调用）
      for (const line of lines) {
        // 检测决策类记忆
        if (line.includes('决定') || line.includes('决策') || line.includes('选择了')) {
          memories.push({
            type: 'decision',
            name: this.extractName(line, '决策'),
            summary: line.substring(0, 200),
            source: file,
            importance: 7,
            tags: ['自动提取', '决策'],
          });
        }

        // 检测教训类记忆
        if (line.includes('错误') || line.includes('失败') || line.includes('教训')) {
          memories.push({
            type: 'lesson',
            name: this.extractName(line, '教训'),
            summary: line.substring(0, 200),
            source: file,
            importance: 8,
            tags: ['自动提取', '教训'],
          });
        }

        // 检测项目进展
        if (line.includes('完成') || line.includes('实现') || line.includes('解决了')) {
          memories.push({
            type: 'project',
            name: this.extractName(line, '项目'),
            summary: line.substring(0, 200),
            source: file,
            importance: 6,
            tags: ['自动提取', '进展'],
          });
        }
      }
    }

    // 去重（基于名称）
    const unique = memories.filter((m, i) =>
      memories.findIndex(x => x.name === m.name) === i
    );

    return unique.slice(0, 10); // 最多提取 10 条
  },

  // 提取名称
  extractName(text: string, prefix: string): string {
    // 简单截取
    const clean = text.replace(/[#*`]/g, '').trim();
    if (clean.length > 50) {
      return `${prefix}: ${clean.substring(0, 47)}...`;
    }
    return `${prefix}: ${clean}`;
  },

  // 生成报告
  generateReport(result: DreamResult): string {
    return `# 🌙 梦境报告

**时间**: ${new Date().toLocaleString('zh-CN')}

## 📊 统计

| 指标 | 数值 |
|------|------|
| 扫描文件 | ${result.scannedFiles} |
| 新增记忆 | ${result.newEntries.length} |
| 更新记忆 | ${result.updatedEntries.length} |

## 🧠 新增记忆

${result.newEntries.length === 0 ? '_无新记忆_' : result.newEntries.map((m, i) => `
${i + 1}. **[${m.type}]** ${m.name}
   - ${m.summary}
`).join('\n')}

---
_由 超梦 (SuperDreams) 自动生成_`;
  },
};

/**
 * xiaoxi-dreams REST API Server
 * 健康度查询、记忆管理、Dream 触发
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const CONFIG = {
  port: process.env.PORT || 18792,
  apiKey: process.env.API_KEY || 'xiaoxi-api-key',
  workspace: process.env.WORKSPACE || path.join(process.env.USERPROFILE, '.openclaw', 'workspace', 'xiaoxi-dreams'),
  memory: process.env.MEMORY_DIR || path.join(process.env.USERPROFILE, '.openclaw', 'workspace', 'memory'),
  dolt: path.join(process.env.USERPROFILE, 'Go', 'bin', 'dolt.exe')
};

// 工具函数
function parseJson(body) {
  try {
    return JSON.parse(body);
  } catch (e) {
    return null;
  }
}

function sendJson(res, data, statusCode = 200) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(data, null, 2));
}

function sendError(res, code, message, statusCode = 400) {
  sendJson(res, { error: { code, message } }, statusCode);
}

function checkAuth(req) {
  const key = req.headers['x-api-key'];
  return key === CONFIG.apiKey;
}

// Dol t查询
function doltQuery(sql) {
  try {
    const result = execSync(`"${CONFIG.dolt}" sql -q "${sql}" --raw`, {
      encoding: 'utf8',
      timeout: 5000
    });
    return result;
  } catch (e) {
    return null;
  }
}

// 路由处理
const routes = {
  // GET /health
  '/health': {
    GET: (req, res) => {
      const history = doltQuery('SELECT date, overall_score FROM health_metrics ORDER BY date DESC LIMIT 1');
      const latest = history ? parseDoltResult(history) : null;
      
      if (latest && latest.length > 0) {
        const score = latest[0].overall_score || 0;
        let status = 'healthy';
        if (score < 50) status = 'critical';
        else if (score < 70) status = 'warning';
        
        sendJson(res, {
          score,
          status,
          date: latest[0].date,
          message: score < 50 ? '健康度严重下降，建议立即检查' :
                   score < 70 ? '健康度偏低，建议关注' : '健康度正常'
        });
      } else {
        sendJson(res, { score: 0, status: 'unknown', message: '暂无数据' });
      }
    }
  },
  
  // GET /health/history
  '/health/history': {
    GET: (req, res) => {
      const days = parseInt(new URL(req.url, `http://localhost`).searchParams.get('days')) || 7;
      const history = doltQuery(`SELECT date, overall_score, freshness, coverage FROM health_metrics ORDER BY date DESC LIMIT ${days}`);
      const data = history ? parseDoltResult(history) : [];
      sendJson(res, { history: data });
    }
  },
  
  // GET /memories
  '/memories': {
    GET: (req, res) => {
      const url = new URL(req.url, `http://localhost`);
      const type = url.searchParams.get('type');
      const limit = parseInt(url.searchParams.get('limit')) || 20;
      const offset = parseInt(url.searchParams.get('offset')) || 0;
      
      let sql = `SELECT id, type, name, summary, importance, created_at FROM memory_entries`;
      const conditions = [];
      if (type) conditions.push(`type = '${type}'`);
      if (conditions.length > 0) sql += ` WHERE ${conditions.join(' AND ')}`;
      sql += ` ORDER BY importance DESC, created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      
      const result = doltQuery(sql);
      const memories = result ? parseDoltResult(result) : [];
      
      sendJson(res, {
        memories,
        total: memories.length,
        page: Math.floor(offset / limit) + 1
      });
    }
  },
  
  // GET /memories/:id
  '/memories/:id': {
    GET: (req, res) => {
      const id = req.params.id;
      const sql = `SELECT * FROM memory_entries WHERE id = '${id}'`;
      const result = doltQuery(sql);
      const memory = result ? parseDoltResult(result)[0] : null;
      
      if (memory) {
        sendJson(res, memory);
      } else {
        sendError(res, 'MEMORY_NOT_FOUND', `记忆 ${id} 不存在`, 404);
      }
    }
  },
  
  // GET /dreams/history
  '/dreams/history': {
    GET: (req, res) => {
      const limit = parseInt(new URL(req.url, `http://localhost`).searchParams.get('limit')) || 10;
      const sql = `SELECT id, date, status, health_score, new_entries, updated_entries FROM dream_sessions ORDER BY date DESC LIMIT ${limit}`;
      const result = doltQuery(sql);
      const dreams = result ? parseDoltResult(result) : [];
      sendJson(res, { dreams });
    }
  },
  
  // POST /dreams/trigger
  '/dreams/trigger': {
    POST: async (req, res) => {
      if (!checkAuth(req)) {
        return sendError(res, 'UNAUTHORIZED', 'API Key 无效', 401);
      }
      
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const data = parseJson(body) || {};
        const mode = data.mode || 'standard';
        const days = data.days || 7;
        
        // 这里触发 Dream（实际实现时调用 PowerShell 脚本）
        sendJson(res, {
          status: 'triggered',
          mode,
          days,
          message: `Dream 已触发，模式: ${mode}, 范围: ${days} 天`
        });
      });
    }
  },
  
  // GET /stats
  '/stats': {
    GET: (req, res) => {
      const totalMemories = doltQuery('SELECT COUNT(*) as count FROM memory_entries');
      const totalDreams = doltQuery('SELECT COUNT(*) as count FROM dream_sessions');
      const recentHealth = doltQuery('SELECT AVG(overall_score) as avg FROM health_metrics WHERE date > DATE_SUB(CURDATE(), INTERVAL 7 DAY)');
      
      sendJson(res, {
        memories: parseInt(parseDoltResult(totalMemories)?.[0]?.count || 0),
        dreams: parseInt(parseDoltResult(totalDreams)?.[0]?.count || 0),
        avgHealth: Math.round(parseFloat(parseDoltResult(recentHealth)?.[0]?.avg || 0))
      });
    }
  },
  
  // 基础信息
  '/': {
    GET: (req, res) => {
      sendJson(res, {
        name: 'xiaoxi-dreams API',
        version: '2.0.0',
        endpoints: [
          'GET /health',
          'GET /health/history',
          'GET /memories',
          'GET /memories/:id',
          'GET /dreams/history',
          'POST /dreams/trigger',
          'GET /stats'
        ]
      });
    }
  }
};

// 解析 Dol t结果
function parseDoltResult(output) {
  if (!output || !output.trim()) return [];
  
  const lines = output.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split('\t');
  const results = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t');
    const row = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = values[idx]?.trim() || null;
    });
    results.push(row);
  }
  
  return results;
}

// 创建服务器
const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  const method = req.method;
  
  console.log(`${method} ${url}`);
  
  // CORS 预检
  if (method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key'
    });
    return res.end();
  }
  
  // 匹配路由
  let matched = false;
  for (const [path, handlers] of Object.entries(routes)) {
    // 精确匹配
    if (url === path && handlers[method]) {
      handlers[method](req, res);
      matched = true;
      break;
    }
    
    // 参数匹配
    const pathParts = path.split('/');
    const urlParts = url.split('/');
    
    if (pathParts.length === urlParts.length && pathParts.length > 0) {
      let params = {};
      let match = true;
      
      for (let i = 0; i < pathParts.length; i++) {
        if (pathParts[i].startsWith(':')) {
          params[pathParts[i].slice(1)] = urlParts[i];
        } else if (pathParts[i] !== urlParts[i]) {
          match = false;
          break;
        }
      }
      
      if (match && handlers[method]) {
        req.params = params;
        handlers[method](req, res);
        matched = true;
        break;
      }
    }
  }
  
  if (!matched) {
    sendError(res, 'NOT_FOUND', `路由 ${method} ${url} 不存在`, 404);
  }
});

// 启动
server.listen(CONFIG.port, () => {
  console.log(`🌀 xiaoxi-dreams API Server`);
  console.log(`═══════════════════════════════`);
  console.log(`📍 http://localhost:${CONFIG.port}`);
  console.log(`🔑 API Key: ${CONFIG.apiKey}`);
  console.log(`📁 Workspace: ${CONFIG.workspace}`);
  console.log(`═══════════════════════════════`);
  console.log(``);
  console.log(`端点:`);
  console.log(`  GET  /health          - 健康度查询`);
  console.log(`  GET  /health/history   - 健康度历史`);
  console.log(`  GET  /memories        - 记忆列表`);
  console.log(`  GET  /memories/:id    - 记忆详情`);
  console.log(`  GET  /dreams/history  - Dream 历史`);
  console.log(`  POST /dreams/trigger   - 触发 Dream`);
  console.log(`  GET  /stats           - 统计信息`);
});

module.exports = server;

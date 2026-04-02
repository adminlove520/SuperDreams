// Vercel Serverless API
// 注意: Dolt 是本地数据库，Serverless 环境无法直接访问
// 方案: 使用 GitHub Gist 作为简单 KV 存储

const GIST_TOKEN = process.env.GITHUB_TOKEN || process.env.GIST_ID;
const GIST_ID = process.env.GIST_ID;

export default async function handler(req, res) {
  const { method, url } = req;
  
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 解析路径
  const path = url.split('?')[0];
  const pathParts = path.split('/').filter(Boolean);
  
  // 跳过 /api 前缀
  const endpoint = pathParts.slice(1).join('/') || '';
  
  // API Key 验证
  const apiKey = req.headers['x-api-key'];
  if (endpoint !== 'health' && endpoint !== '') {
    if (apiKey !== process.env.API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }
  
  try {
    switch (endpoint) {
      case 'health':
        // 获取健康度 (从 Gist)
        return res.status(200).json(await getHealth());
        
      case 'memories':
        // 获取记忆列表 (从 Gist)
        return res.status(200).json(await getMemories());
        
      case 'stats':
        // 获取统计
        return res.status(200).json(await getStats());
        
      case 'dreams/history':
        return res.status(200).json(await getDreamsHistory());
        
      case '':
        // 根路径
        return res.status(200).json({
          name: 'xiaoxi-dreams API',
          version: '2.0.0',
          mode: 'serverless',
          endpoints: [
            'GET /api/health',
            'GET /api/memories',
            'GET /api/stats',
            'GET /api/dreams/history',
            'POST /api/dreams/trigger'
          ]
        });
        
      default:
        return res.status(404).json({ error: 'Not found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}

// 获取 Gist 内容
async function fetchGist() {
  if (!GIST_ID || !GIST_TOKEN) {
    return { health: { score: 0, status: 'unknown' }, memories: [], stats: {} };
  }
  
  const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    headers: {
      'Authorization': `Bearer ${GIST_TOKEN}`,
      'Accept': 'application/vnd.github+json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch Gist');
  }
  
  const gist = await response.json();
  const content = gist.files['xiaoxi-dreams.json']?.content;
  
  return content ? JSON.parse(content) : { health: {}, memories: [], stats: {} };
}

// 保存 Gist 内容
async function saveGist(data) {
  if (!GIST_ID || !GIST_TOKEN) {
    return;
  }
  
  const gist = await fetchGist();
  const newContent = { ...gist, ...data, updated: new Date().toISOString() };
  
  await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${GIST_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github+json'
    },
    body: JSON.stringify({
      files: {
        'xiaoxi-dreams.json': {
          content: JSON.stringify(newContent, null, 2)
        }
      }
    })
  });
}

async function getHealth() {
  const data = await fetchGist();
  const health = data.health || { score: 0 };
  
  let status = 'unknown';
  if (health.score >= 70) status = 'healthy';
  else if (health.score >= 50) status = 'warning';
  else if (health.score > 0) status = 'critical';
  
  return {
    score: health.score,
    status,
    date: health.date || null,
    message: status === 'healthy' ? '健康度正常' :
             status === 'warning' ? '健康度偏低' :
             status === 'critical' ? '健康度严重下降' : '暂无数据'
  };
}

async function getMemories() {
  const data = await fetchGist();
  const memories = data.memories || [];
  
  return {
    memories: memories.slice(0, 20),
    total: memories.length,
    page: 1
  };
}

async function getStats() {
  const data = await fetchGist();
  const memories = data.memories || [];
  const dreams = data.dreams || [];
  
  return {
    memories: memories.length,
    dreams: dreams.length,
    avgHealth: data.health?.score || 0
  };
}

async function getDreamsHistory() {
  const data = await fetchGist();
  const dreams = data.dreams || [];
  
  return {
    dreams: dreams.slice(0, 10)
  };
}

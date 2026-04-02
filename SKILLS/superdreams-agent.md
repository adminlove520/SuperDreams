---
name: superdreams-agent
description: "SuperDreams 认知记忆管理 — 上传记忆、触发做梦、查看健康度、同步到中心。触发词：上传记忆、记录记忆、save memory、做梦、dream、查看健康度、同步到中心、sync、记忆状态"
---

# 🧠 SuperDreams Agent — 认知记忆管理 Skill

> 让 openclaw龙虾通过 API 管理自己的认知记忆系统

## 配置

### 环境变量

在使用前需要知道 Agent Dashboard 的地址：

```
# 本地开发
SUPERDREAMS_URL=http://localhost:3000

# 生产环境 (Vercel 部署)
SUPERDREAMS_URL=https://your-agent.vercel.app

# 同步到 Center 时需要
CENTER_URL=https://your-center.vercel.app
CENTER_API_KEY=your-api-key
```

---

## 一、上传记忆

### 单条记忆

```bash
# 使用 web_fetch 或 curl
POST ${SUPERDREAMS_URL}/api/memories
Content-Type: application/json

{
  "name": "记忆标题（必填）",
  "type": "lesson",
  "summary": "一句话摘要",
  "content": "详细内容，可以很长",
  "importance": 7,
  "tags": ["标签1", "标签2"],
  "source": "daily-log"
}
```

### 记忆类型 (type)

| 类型 | 说明 | 示例 |
|------|------|------|
| `lesson` | 教训/经验 | "永远不要在周五发版" |
| `decision` | 重要决策 | "选择 Next.js 而非 Remix" |
| `fact` | 客观事实 | "Redis 最大连接数 10000" |
| `procedure` | 操作流程 | "部署到 Vercel 的步骤" |
| `person` | 人物信息 | "哥哥的偏好和习惯" |
| `project` | 项目进展 | "SuperDreams v4.1 发布" |

### 重要度 (importance)

- `1-3`: 低优先，日常琐碎
- `4-6`: 一般，有参考价值
- `7-8`: 重要，应该记住
- `9-10`: 关键，永远不能忘

### 实际调用示例

```javascript
// 使用 web_fetch 上传一条教训
await web_fetch({
  urls: ['${SUPERDREAMS_URL}/api/memories'],
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: '不要在 package.json 用 ^ 前缀锁定依赖',
    type: 'lesson',
    summary: '使用 ^ 导致 Next.js 从 14 升级到 16，Turbopack 不兼容 webpack 配置',
    content: '2026-04-02 部署失败。根目录 package.json 有 next@^16.2.2，Vercel 安装了 Next 16，而 agent 的 sql.js WASM 需要 webpack 配置，Turbopack 不支持。解决：锁定为 next@14.2.35（无前缀）。',
    importance: 8,
    tags: ['vercel', 'next.js', 'deployment', '教训'],
    source: 'daily-log'
  })
})
```

---

## 二、查询记忆

### 列出所有记忆

```
GET ${SUPERDREAMS_URL}/api/memories
GET ${SUPERDREAMS_URL}/api/memories?type=lesson&limit=10
GET ${SUPERDREAMS_URL}/api/memories?search=vercel
GET ${SUPERDREAMS_URL}/api/memories?type=decision&limit=5&offset=10
```

**参数：**
- `type`: 按类型过滤 (lesson/decision/fact/procedure/person/project)
- `limit`: 返回数量，默认 50
- `offset`: 分页偏移
- `search`: 搜索关键词（匹配 name、summary、tags）

**响应：**
```json
{
  "memories": [
    {
      "id": "mem_xxx",
      "type": "lesson",
      "name": "...",
      "summary": "...",
      "importance": 8,
      "tags": ["..."],
      "created_at": "2026-04-02T..."
    }
  ],
  "total": 42
}
```

### 查询单条记忆

```
GET ${SUPERDREAMS_URL}/api/memories/{id}
```

---

## 三、触发做梦

做梦 = 扫描日志 → 提取记忆 → 计算健康度 → 生成报告

```
POST ${SUPERDREAMS_URL}/api/dreams
```

**无需请求体**。系统自动：
1. 扫描 `memory/` 目录下的日志文件
2. 用 LLM 提取教训、决策、事实
3. 去重并整合到数据库
4. 计算五维健康度分数
5. 返回梦境报告

**响应：**
```json
{
  "status": "completed",
  "dream": {
    "id": "dream_xxx",
    "status": "completed",
    "health_score": 82,
    "scanned_files": 5,
    "new_entries": 3,
    "updated_entries": 1,
    "report": "## 梦境报告\n...",
    "started_at": "...",
    "completed_at": "..."
  }
}
```

### 查看做梦历史

```
GET ${SUPERDREAMS_URL}/api/dreams
GET ${SUPERDREAMS_URL}/api/dreams?limit=5
```

---

## 四、查看健康度

### 当前健康度

```
GET ${SUPERDREAMS_URL}/api/health
```

**响应：**
```json
{
  "score": 82,
  "status": "healthy",
  "dimensions": {
    "freshness": 0.75,
    "coverage": 0.80,
    "coherence": 0.72,
    "efficiency": 0.85,
    "accessibility": 0.78
  },
  "date": "2026-04-02",
  "trend": "up"
}
```

### 健康度历史

```
GET ${SUPERDREAMS_URL}/api/health?history=true&days=30
```

---

## 五、查看统计

```
GET ${SUPERDREAMS_URL}/api/stats
```

**响应：**
```json
{
  "memories": 42,
  "dreams": 7,
  "avgHealth": 82,
  "connections": 156,
  "typeDistribution": {
    "lesson": 12,
    "decision": 8,
    "fact": 10,
    "project": 5,
    "procedure": 4,
    "person": 3
  }
}
```

---

## 六、同步到 Center

将 Agent 的记忆和梦境同步到控制中心（多 Agent 管理）。

```bash
POST ${SUPERDREAMS_URL}/api/sync
Content-Type: application/json

{
  "centerUrl": "https://your-center.vercel.app",
  "apiKey": "your-center-api-key"
}
```

**响应：**
```json
{
  "success": true,
  "status": "synced",
  "memories": { "sent": 42, "status": 200 },
  "dreams": { "sent": 5, "status": 200 }
}
```

### 查看同步日志

```
GET ${SUPERDREAMS_URL}/api/sync?action=logs
```

---

## 七、日常使用场景

### 场景 1：每日记录

当用户跟龙虾聊天中产生了有价值的信息，龙虾应自动判断并上传：

```
用户：今天学到 Vercel KV 已经被弃用了，要用 Upstash Redis
龙虾：（自动上传）
  POST /api/memories
  {
    "name": "Vercel KV 已弃用，迁移到 Upstash Redis",
    "type": "fact",
    "summary": "@vercel/kv 已弃用，官方推荐 @upstash/redis 替代",
    "importance": 7,
    "tags": ["vercel", "redis", "upstash", "迁移"]
  }
```

### 场景 2：睡前做梦

```
用户：做个梦吧
龙虾：POST /api/dreams → 返回梦境报告
```

### 场景 3：健康自查

```
用户：看看记忆状态
龙虾：
  GET /api/health → 当前健康度
  GET /api/stats  → 记忆分布统计
  综合输出报告
```

### 场景 4：同步到中心

```
用户：同步一下
龙虾：POST /api/sync → 上报到 Center
```

---

## 八、安装配置步骤

### 1. 部署 Agent Dashboard

```bash
cd agent
npm install
npm run build
# 或部署到 Vercel
```

### 2. 配置 Vercel 环境变量

在 Vercel Dashboard → agent 项目 → Settings → Environment Variables：

```
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxx
```

### 3. 在 Agent 中安装 Skill

将此文件放到你的 Agent 的 Skills 目录：

```
~/.accio/accounts/{account}/agents/{agent}/agent-core/skills/superdreams-agent/SKILL.md
```

或者在项目 SKILLS 目录：

```
D:\xiaoxi-dreams/SKILLS/superdreams-agent.md
```

### 4. 设置定时做梦（可选）

通过 cron 设置每天凌晨 4 点自动做梦：

```javascript
// 使用 Accio cron
cron.add({
  name: 'SuperDreams 每日做梦',
  schedule: { kind: 'cron', expr: '0 4 * * *', tz: 'Asia/Shanghai' },
  payload: {
    kind: 'agent',
    message: '执行 SuperDreams 做梦流程：POST /api/dreams，然后汇报结果'
  }
})
```

---

## 九、数据架构

```
Agent (Upstash Redis)                    Center (Upstash Redis)
┌─────────────────────┐                  ┌─────────────────────┐
│ sd:memory:{id}      │                  │ ctr:agent:{id}      │
│ sd:memories:ids     │ ── POST ──→      │ ctr:memory:{id}     │
│ sd:dream:{id}       │   /api/sync      │ ctr:dream:{id}      │
│ sd:dreams:ids       │                  │ ctr:synclog:{id}    │
│ sd:health:{id}      │                  │ ctr:agents:index    │
│ sd:synclogs:ids     │                  └─────────────────────┘
└─────────────────────┘
    本地: SQLite (sql.js)
    生产: Upstash Redis
```

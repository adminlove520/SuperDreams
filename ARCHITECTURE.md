# SuperDreams v4.0 — 完整架构设计

> 设计日期：2026-04-02
> 设计者：Accio (AI Assistant)
> 审核：哥哥

---

## 一、项目定位

### 1.1 SuperDreams 是什么？

**一句话**：AI Agent 的认知记忆系统 — 通过"做梦"实现记忆整合、反思和进化。

**三层价值**：
1. **做梦引擎**：扫描日志 → 提取记忆 → 健康评估 → 生成报告（真实做梦，不是模拟）。
2. **个体仪表盘**：每只龙虾（Agent）有自己的 Dashboard，可视化记忆网络和成长轨迹。
3. **控制中心**：中央服务，管理多个龙虾 Agent，跨 Agent 搜索，赛博永生/数字生命。

### 1.2 核心概念

| 术语 | 含义 |
|------|------|
| **龙虾** (Lobster) | 一个 AI Agent 实例，拥有独立记忆库 |
| **做梦** (Dream) | 周期性记忆整合过程：扫描→提取→去重→评分→报告 |
| **超梦** (Superdream) | 整个系统的品牌名 — 超越普通做梦的认知进化 |
| **控制中心** (Control Center) | 中央服务，管理多只龙虾，提供跨 Agent 搜索和全局视图 |
| **健康度** (Health Score) | 五维加权评分，量化记忆系统的"精神状态" |

---

## 二、架构总览

### 2.1 两层架构

```
┌────────────────────────────────────────────────────────┐
│                   SuperDreams                          │
│                                                        │
│ ┌──────────────────┐   ┌──────────────────────────┐    │
│ │  Agent (龙虾)    │   │  Control Center (中枢)   │    │
│ │                  │   │                         │    │
│ │ ┌──────────┐     │   │ ┌──────────┐            │    │
│ │ │Dashboard │ UI  │   │ │Dashboard │ UI         │    │
│ │ │(Next.js) │     │   │ │(Next.js) │            │    │
│ │ └────┬─────┘     │   │ └─────┬─────┘           │    │
│ │      │           │   │       │                 │    │
│ │ ┌────┴─────┐     │   │ ┌─────┴──────┐          │    │
│ │ │API Routes│     │   │ │ API Routes │          │    │
│ │ │+ Dream   │─────┼──▶│ + Auth       │          │    │
│ │ │  Engine  │ sync│   │ + Search     │          │    │
│ │ └────┬─────┘     │   │ └─────┬──────┘          │    │
│ │      │           │   │       │                 │    │
│ │ ┌────┴─────┐     │   │ ┌─────┴──────┐          │    │
│ │ │ SQLite   │     │   │ │  SQLite    │          │    │
│ │ │ (本地)   │     │   │ │  (中央)    │          │    │
│ │ └──────────┘     │   │ └────────────┘          │    │
│ └──────────────────┘   └──────────────────────────┘    │
└────────────────────────────────────────────────────────┘
```

### 2.2 关键决策

| 决策 | 选择 | 理由 |
|------|------|------|
| **存储** | SQLite | 每人一个 .db 文件，fork 后即用；比 JSON 可靠、支持查询。 |
| **Web 框架** | Next.js 14 | 全栈一体，API Routes + SSR/CSR。 |
| **做梦引擎** | 内置于 API Route | 无需独立进程，Vercel 兼容。 |
| **鉴权** | API Key + JWT | Agent→Center 靠 API Key 注册，获取 JWT 做后续请求。 |
| **部署** | Vercel | 免费、全球 CDN、Serverless。 |

---

## 三、目录结构

```
SuperDreams/                      # 仓库根目录
├── agent/                        # 🦞 龙虾 Agent (个体)
│   ├── app/                      # UI 页面与 API 路由
│   ├── components/               # UI 组件 (HealthRing, StatsGrid等)
│   ├── lib/                      # 核心引擎 (db.ts, dream-engine.ts)
│   └── data/                     # superdreams.db (SQLite)
├── center/                       # 🏢 控制中心 (中央)
│   ├── app/                      # 管理后台 UI
│   └── lib/                      # 中央数据库与鉴权逻辑
├── scripts/                      # CLI 脚本 (dream.js)
├── memory/                       # 原始日志存放处 (做梦源)
└── SKILLS/                       # OpenClaw 技能定义
```

---

## 四、核心流程：做梦 (Dreaming)

### 4.1 五阶段流水线

1.  **扫描 (Scan)**：读取 `memory/*.md`。
2.  **提取 (Extract)**：LLM 提取事实 (Facts)、决策 (Decisions)、教训 (Lessons)。
3.  **去重 (Deduplicate)**：计算新提取内容与 DB 的相似度，防止重复。
4.  **评估 (Score)**：计算健康度分数。
5.  **整合 (Consolidate)**：更新 SQLite，并同步到 `MEMORY.md` 索引。

### 4.2 健康度公式

```
Score = freshness*0.25 + coverage*0.25 + coherence*0.20 + efficiency*0.15 + accessibility*0.15
```

---

## 五、API 设计 (Agent)

- `GET /api/memories`：搜索记忆
- `POST /api/dreams`：手动触发做梦
- `GET /api/health`：获取历史健康度
- `POST /api/sync`：同步数据到控制中心

## 六、v4.1 新增

### 6.1 霓虹发光 UI 系统

Agent Dashboard 引入完整的赛博/霓虹视觉系统：

| CSS 类 | 用途 |
|--------|------|
| `.neon-text-green/blue/purple/cyan/orange` | 带发光 text-shadow 的文字 |
| `.neon-card` / `.neon-card-blue` / `.neon-card-purple` | 带渐变背景和发光边框的卡片 |
| `.neon-btn` | 发光按钮（渐变背景 + box-shadow） |
| `.ambient-glow` / `.grid-bg` | 页面级背景效果 |
| `.stat-value-*` | 统计数值专用发光 |

### 6.2 记忆矩阵 (MemoryMatrix)

可视化记忆类型分布，显示各类型的计数、占比和动画进度条。

### 6.3 同步日志 (SyncLog)

Agent 端同步操作的完整日志记录，存储在 SQLite `sync_log` 表中，通过 `/api/sync?action=logs` API 查询。

### 6.4 Vercel KV 持久化

Control Center 的 `store.ts` 自动检测环境：
- 有 `KV_REST_API_URL` + `KV_REST_API_TOKEN` → 使用 Vercel KV (Redis 兼容)
- 否则 → 使用本地 better-sqlite3

KV Key Schema:
```
agent:{id}, agents:index, memory:{id}, memories:agent:{agentId},
dream:{id}, dreams:agent:{agentId}, synclog:{id}, synclog:all
```

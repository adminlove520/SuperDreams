# SuperDreams 超梦 Agent 使用指南

## 这是什么

**SuperDreams (超梦)** 是 AI Agent 的认知记忆系统 — 周期性"做梦"，整合每日日志到长期记忆，量化认知健康度。

## 核心理念

```
睡觉时整理 → 醒来时更聪明
数据驱动进化 → 可视化记忆系统
```

## 什么时候做梦

- **每天定时**：默认 cron 04:00 自动运行。
- **手动触发**：在 Dashboard 点击「触发 Dream」或运行 `npm run dream`。
- **指令触发**：当用户说"整理记忆"、"做个梦"、"Dream now"时。

## Dream 流程 (v4.0)

1. **扫描 (Scan)**：读取 `memory/` 目录下的所有 `.md` 日志文件。
2. **提取 (Extract)**：利用 LLM 提取事实、决策、教训、人物。
3. **去重 (Deduplicate)**：与现有 `MEMORY.md` 和数据库对比，防止冗余。
4. **评估 (Evaluate)**：根据五维公式计算系统健康度 (Health Score)。
5. **整合 (Consolidate)**：更新 SQLite 数据库并同步到 `MEMORY.md`。
6. **报告 (Report)**：生成梦境报告，记录洞察与建议。

## 目录结构 (v4.0)

```
superdreams/
├── agent/          # 🦞 Agent Dashboard (Next.js + sql.js)
│   ├── app/        #    UI 页面与 API 路由
│   ├── lib/        #    核心引擎 (db, dream-engine, health)
│   └── data/       #    SQLite 数据库存储
├── center/         # 🏢 Control Center (多 Agent 管理中心)
├── scripts/        #    CLI 工具 (dream.js)
├── memory/         #    做梦扫描源 (每日日志)
└── SKILLS/         #    OpenClaw 技能定义
```

## 记忆层级

| 层级 | 存储 | 内容 |
|------|------|------|
| **长期记忆** | `MEMORY.md` | 核心事实、重大决策、用户偏好、关键里程碑 |
| **情景记忆** | SQLite (memories) | 具体的事件、对话片段、项目细节、带时间戳的记录 |
| **元记忆** | SQLite (dreams) | 做梦记录、系统健康度轨迹、认知分析报告 |

## 健康度评分公式

```
Score = freshness×0.25 + coverage×0.25 + coherence×0.20 + efficiency×0.15 + accessibility×0.15
```

| 维度 | 含义 | 权重 |
|------|------|------|
| **新鲜度** | 7天内活跃记忆占比 + 总量基数 | 25% |
| **覆盖度** | 教训/决策类记忆占比 + 类型多样性 | 25% |
| **连贯度** | 记忆间的关联密度 (重要度平均值) | 20% |
| **效率** | 存储密度 (log 缩放) | 15% |
| **可达性** | 事实/流程类记忆检索密度 | 15% |

## 安全与规范

1. **只增不减**：原始日志文件永远不删除。
2. **去重优先**：做梦引擎会自动识别重复信息，保持 MEMORY.md 精简。
3. **手动干预**：可以手动编辑 MEMORY.md，下次做梦会自动同步状态。
4. **隐私保护**：本地 SQLite 存储，不上传敏感原始日志。

## 相关资源

- **Dashboard**: `http://localhost:3000`
- **Control Center**: `http://localhost:3001`
- **Repo**: [adminlove520/superdreams](https://github.com/adminlove520/superdreams)

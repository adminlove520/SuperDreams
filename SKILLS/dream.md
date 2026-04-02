---
name: dream
description: "SuperDreams 周期性做梦 — 整合每日日志到长期记忆，生成健康报告。触发词：做梦、整理记忆、Dream now、做个梦"
---

# 🌀 Dream — SuperDreams 认知记忆整合

## 何时使用

- 每天定时（cron 04:00）。
- 用户说 "整理记忆"、"做个梦"。
- `memory/` 目录下有新的 `.md` 日志时。

## Dream 流程 (v4.0)

```
触发 -> 扫描 (Scan) -> 提取 (Extract) -> 去重 (Deduplicate) -> 评估 (Score) -> 整合 (Consolidate) -> 报告
```

## 核心组件

- **Scanner**: 递归读取 `memory/` 下的日期命名的 `.md` 文件。
- **Extractor**: 使用 LLM 识别决策、教训、事实和项目进展。
- **Scorer**: 基于五维公式计算系统健康度。
- **Storage**: 更新 `agent/data/superdreams.db` (SQLite)。

## 健康度计算

```
Score = freshness*0.25 + coverage*0.25 + coherence*0.20 + efficiency*0.15 + accessibility*0.15
```

- **新鲜度 (Freshness)**: 记忆的时效性。
- **覆盖度 (Coverage)**: 记忆类型的多样性。
- **连贯度 (Coherence)**: 记忆间的逻辑关联。
- **效率 (Efficiency)**: 存储与检索效率。
- **可达性 (Accessibility)**: 核心事实的可提取性。

## 运行方式

### CLI 方式
```bash
node scripts/dream.js
```

### Dashboard 方式
访问 `http://localhost:3000/dreams` 点击 "触发 Dream"。

## 输出规则

1. **更新数据库**: 写入 `memories` 和 `dreams` 表。
2. **生成报告**: 输出 Markdown 格式的梦境洞察报告。
3. **安全规范**: 绝不删除原始日志文件，保持数据的可溯源性。

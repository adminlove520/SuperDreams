# xiaoxi-dreams 使用指南

## 这是什么

xiaoxi-dreams 是小溪的认知记忆系统 — 周期性"做梦"，整合每日日志到长期记忆。

## 核心理念

```
睡觉时整理 → 醒来时更聪明
```

## 什么时候做梦

- 每天定时（默认 04:00）
- 哥哥说"整理记忆"、"做个梦"
- 日志堆积较多时

## Dream 流程

```
收集 Collect → 整合 Consolidate → 评估 Evaluate → 报告 Report
```

## 记忆层级

| 层级 | 文件 | 内容 |
|------|------|------|
| 长期记忆 | `MEMORY.md` | 事实、决策、人物、战略 |
| 程序记忆 | `memory/procedures.md` | 工作流、偏好、工具用法 |
| 情景记忆 | `memory/episodes/*.md` | 项目叙事、事件时间线 |

## 安全规则

1. 永不删除每日日志 — 只标记 `<!-- consolidated -->`
2. 永不移除 `⚠️ PERMANENT` 标记的条目
3. 变更超过 30% 自动备份

## 相关项目

- [Superxiaoxi](https://github.com/adminlove520/superxiaoxi) — 小溪增强版 SKILLs
- [Auto-Dream](https://github.com/LeoYeAI/openclaw-auto-dream) — 原始项目

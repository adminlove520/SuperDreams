---
name: dream-v2
description: "Dream v2 — Generator-Evaluator 三 Agent 系统。触发词：做梦v2、Dream v2"
---

# 🌀 Dream v2 — 认知进化引擎

> 基于 Generator-Evaluator 思想设计

## 三 Agent 架构

1. **Planner Agent**: 决定做梦的范围（最近 7 天或全部）和关注重点。
2. **Generator Agent**: 执行实际的记忆提取和整合，生成报告草稿。
3. **Evaluator Agent**: 评审报告质量，如发现幻觉或逻辑不通，则要求重做。

## 执行示例

```
用户：执行 Dream v2
  ↓
Planner: 分析当前记忆状态 -> 决定重点关注"教训"维度
  ↓
Generator: 扫描日志 -> 提取 5 条新教训 -> 生成初稿
  ↓
Evaluator: 发现第 3 条教训与上周记忆冲突 -> 打回修改
  ↓
Generator: 修正冲突 -> 生成终稿
  ↓
系统：更新数据库 -> 输出最终梦境报告
```

## 优势

- **更高质量**: 经过 Evaluator 评审，减少错误提取。
- **更深洞察**: Planner 会根据健康度趋势自动调整关注点。
- **自动纠错**: 能够识别并修正记忆间的逻辑矛盾。

## 运行

目前在 `scripts/dream.js` 中集成了基础的 v2 逻辑。
未来将支持通过 `center/` 进行多 Agent 协同做梦。

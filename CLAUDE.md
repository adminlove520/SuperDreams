# xiaoxi-dreams Agent 使用指南

## 这是什么

xiaoxi-dreams 是小溪的认知记忆系统 — 周期性"做梦"，整合每日日志到长期记忆。

## 核心理念

```
睡觉时整理 → 醒来时更聪明
任务不丢失 → 用 Beads 追踪
```

## 什么时候做梦

- 每天定时（cron 04:00）
- 哥哥说"整理记忆"、"做个梦"
- 日志堆积较多时

## Dream 流程

```
收集 Collect → 整合 Consolidate → 评估 Evaluate → 报告 Report
```

## 触发 Dream

```
哥哥：做个梦
小溪：好的，开始整理记忆...
```

## 输出示例

```markdown
## 🌀 梦境报告 — 2026-04-02

### 📊 统计
- 扫描: 7 文件 | 新增: 3 | 更新: 2

### 🧠 健康度: 78/100 (↑5)

### 🔮 洞察
- 今天解决了 exec 权限配置问题
- 学习了 Claude Code 7 层记忆架构
- 发布了 xiaoxi-dreams v1.0

### 📝 变更
- [mem_001] 新增：exec 配置修复方案
- [mem_002] 更新：Claude Code 架构学习笔记

### 💡 建议
- 考虑将 Beads 任务追踪集成到工作流
```

## Beads 任务追踪

> ⚠️ Beads 需要 Dolt 后端。未安装请参考 `docs/BEADS_INTEGRATION.md`

重要任务用 `bd` 管理：

```bash
# 初始化（安装 Dolt 后）
bd init --server

# 创建任务
bd create "修复 exec 权限问题" -p 0

# 领取任务
bd update bd-xxx --claim

# 添加依赖
bd dep add bd-xxx bd-yyy

# 查看可执行任务
bd ready

# 完成任务
bd close bd-xxx --reason "已完成"
```

**两层任务系统：**
- `bd` — 持久化任务（跨会话，重要任务）
- `memory/` — 临时日志和上下文

## 记忆层级

| 层级 | 文件 | 内容 |
|------|------|------|
| 长期记忆 | `MEMORY.md` | 事实、决策、人物、战略 |
| 程序记忆 | `memory/procedures.md` | 工作流、偏好、工具用法 |
| 情景记忆 | `memory/episodes/*.md` | 项目叙事、事件时间线 |

## 安全规则

1. 永不删除每日日志 — 只标记 `<!-- consolidated -->`
2. 永不移除 `⚠️ PERMANENT` 标记的条目
3. MEMORY.md 上限 200 行
4. 大变更前先备份

## 健康度评分

```
health = (新鲜度×0.25 + 覆盖度×0.25 + 连贯度×0.2 + 效率×0.15 + 可达性×0.15) × 100
```

### 五维指标

| 指标 | 含义 | 权重 |
|------|------|------|
| 新鲜度 | 最近30天被引用的条目占比 | 0.25 |
| 覆盖度 | 最近14天有更新的知识类别 | 0.25 |
| 连贯度 | 至少有一个关联的条目占比 | 0.20 |
| 效率 | MEMORY.md 精简程度 | 0.15 |
| 可达性 | 记忆图谱连通程度 | 0.15 |

## 智能跳过

如果检测到：
- 近 7 天无新日志 → 快速退出
- 健康度 > 90 → 只做轻量检查
- 上次 Dream < 6 小时前 → 跳过

## 相关项目

- [Superxiaoxi](https://github.com/adminlove520/superxiaoxi) — 小溪增强版 SKILLs
- [Auto-Dream](https://github.com/LeoYeAI/openclaw-auto-dream) — 原始项目

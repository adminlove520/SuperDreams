---
name: dream
description: "小溪周期性做梦 — 整合每日日志到长期记忆，生成健康报告。触发词：做梦、整理记忆、Dream now"
---

# 🌀 Dream — 小溪的认知记忆整合

## 何时使用

- 每天定时（cron）或手动触发
- "整理记忆"
- "做个梦"
- 日志堆积较多时
- "整理任务"、"检查待办"

## Beads 集成

[Beads](https://github.com/steveyegge/beads) 是小溪的任务追踪层：

```bash
# 常用命令
bd init                    # 初始化项目
bd create "任务名" -p 0    # 创建 P0 任务
bd update <id> --claim    # 领取任务
bd dep add <child> <parent> # 添加依赖
bd ready                  # 查看可执行任务
```

**两层任务系统：**
- `bd` — 持久化任务（跨会话，重要任务）
- `memory/` — 临时日志和上下文

## Dream 流程

### Step 1: 收集 Collect

读取 `memory/YYYY-MM-DD.md`（最近7天未处理的日志）

提取：
- 决策 decisions
- 教训 lessons  
- 人物 people
- 项目 projects
- 事实 facts
- 待办 todos

### Step 2: 整合 Consolidate

对比 `MEMORY.md`：
- 新内容 → 追加
- 已有内容 → 更新
- 重复 → 跳过

写入：
- `memory/procedures.md` — 工作流偏好
- `memory/episodes/` — 项目情景（如有）

标记已处理日志：`<!-- consolidated -->`

### Step 3: 评估 Evaluate

**重要性评分：**
```
importance = (base_weight × recency_factor × reference_boost) / 8.0
```

**健康度计算：**
```
health = (新鲜度×0.25 + 覆盖度×0.25 + 连贯度×0.2 + 效率×0.15 + 可达性×0.15) × 100
```

### Step 4: 生成报告

输出一份报告：
```
## 🌀 梦境报告 — YYYY-MM-DD

### 📊 统计
- 扫描: N 文件 | 新增: N | 更新: N

### 🧠 健康度: XX/100

### 🔮 洞察
- [洞察内容]

### 📝 变更
- [mem_XXX] 新增/更新内容

### 💡 建议
- [建议内容]
```

## 输出规则

- 推送到当前聊天
- 报告存入 `memory/dream-log.md`

## 安全规则

1. 永不删除日志文件
2. 永不移除 `⚠️ PERMANENT` 标记
3. 大变更前先备份

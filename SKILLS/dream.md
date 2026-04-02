---
name: dream
description: "小溪周期性做梦 — 整合每日日志到长期记忆，生成健康报告。触发词：做梦、整理记忆、Dream now、做个梦"
---

# 🌀 Dream — 小溪的认知记忆整合

## 何时使用

- 每天定时（cron 04:00）
- 哥哥说"整理记忆"、"做个梦"
- 日志堆积较多时
- "整理任务"、"检查待办"

## Dream 流程

```
收集 Collect → 整合 Consolidate → 评估 Evaluate → 报告 Report
```

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
```markdown
## 🌀 梦境报告 — YYYY-MM-DD

### 📊 统计
- 扫描: N 文件 | 新增: N | 更新: N

### 🧠 健康度: XX/100 (↑或↓变化)

### 🔮 洞察
- [洞察内容]

### 📝 变更
- [mem_XXX] 新增/更新内容

### 💡 建议
- [建议内容]
```

## Beads 任务追踪（需要安装 Dolt）

> ⚠️ Beads 需要 Dolt 后端。未安装请参考 `docs/BEADS_INTEGRATION.md`

重要任务用 `bd` 管理：
```bash
bd create "任务名" -p 0    # P0 最高优先级
bd ready                   # 查看可执行任务
bd update <id> --claim     # 领取任务
bd close <id> --reason ""  # 完成
```

**两层任务系统：**
- `bd` — 持久化任务（跨会话，重要任务）
- `memory/` — 临时日志和上下文

## 输出规则

- 推送到当前聊天
- 报告存入 `memory/dream-log.md`

## 安全规则

1. 永不删除日志文件 — 只标记 `<!-- consolidated -->`
2. 永不移除 `⚠️ PERMANENT` 标记的条目
3. 大变更前先备份
4. MEMORY.md 上限 200 行

## 智能跳过逻辑

如果检测到：
- 近 7 天无新日志 → 快速退出
- 健康度 > 90 → 只做轻量检查
- 上次 Dream < 6 小时前 → 跳过

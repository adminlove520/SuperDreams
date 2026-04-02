# Beads 集成指南

> Beads 需要 Dolt 存储后端，当前环境未安装 Dolt。

## 环境要求

- **Dolt** — 版本控制 SQL 数据库
  - 安装：https://docs.dolthub.com/introduction/installation
  - 或：`go install github.com/dolthub/dolt@latest`

- **Beads** — v0.60.0+
  - 安装：`go install github.com/steveyegge/beads/cmd/bd@latest`

## 初始化 Beads（安装 Dolt 后）

```bash
# 初始化 beads
cd xiaoxi-dreams
bd init --server

# 设置 claude 集成
bd setup claude
```

## Beads 工作流

### 1. 创建任务
```bash
bd create "完善 xiaoxi-dreams cron 任务" -p 0
bd create "集成 Beads 任务追踪" --deps blocks:<task-id>
```

### 2. 工作中
```bash
bd ready                    # 查看可执行任务
bd update <id> --claim     # 领取任务
```

### 3. 完成
```bash
bd close <id> --reason "完成集成"
```

## xiaoxi-dreams 的 Beads 任务示例

```
bd create "完善 xiaoxi-dreams cron 定时任务" -p 0
bd create "Beads 任务追踪集成到工作流" -p 1
bd create "优化 xiaoxi-dreams 文档" -p 2
```

## 相关资源

- [Beads SKILL.md](../workspace/beads/claude-plugin/skills/beads/SKILL.md)
- [Beads GitHub](https://github.com/steveyegge/beads)
- [Dolt 安装指南](https://docs.dolthub.com/introduction/installation)

# 🌀 xiaoxi-dreams

> 小溪的认知记忆系统 — 周期性做梦，让 AI 更聪明地醒来

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/adminlove520/xiaoxi-dreams)](https://github.com/adminlove520/xiaoxi-dreams/stargazers)

基于 [Auto-Dream](https://github.com/LeoYeAI/openclaw-auto-dream) 理念构建，参考 [Claude Code 7 层记忆架构](https://x.com/troyhua/status/2039052328070734102) 设计。

---

## 是什么

小溪每天会在后台"做梦" — 扫描每日日志、提取关键知识、整理成长期记忆，并发送报告给你。

**解决问题：**
- 日志堆积但从不回顾
- 重要决策找不到
- 不知道小溪学到了什么

---

## ✨ 核心功能

- 🧠 **智能记忆整合** — 日志 → 结构化记忆
- 📊 **健康评分** — 5维指标追踪记忆系统健康度
- 🔔 **推送报告** — 每次 Dream 后主动汇报
- 📈 **成长追踪** — 记录连续做梦次数、记忆增长
- ✅ **Beads 任务追踪** — 持久化任务、依赖图、跨会话（需要 Dolt）

---

## 🚀 快速开始

### 安装

```bash
git clone https://github.com/adminlove520/xiaoxi-dreams.git
cd xiaoxi-dreams
./scripts/setup.ps1    # Windows
# 或
./scripts/setup.sh    # Linux/macOS
openclaw gateway restart
```

详细安装见 [INSTALL.md](docs/INSTALL.md)

### 触发 Dream

```bash
# 自动（每天 04:00）- 已配置 cron
# 或手动：
"做个梦"
```

---

## 📁 项目结构

```
xiaoxi-dreams/
├── SKILLS/
│   └── dream.md              # 核心做梦技能
├── docs/
│   ├── README.md             # 文档目录
│   ├── INSTALL.md            # 安装指南
│   ├── WORKFLOW.md           # 工作流
│   ├── ARCHITECTURE.md       # 架构设计
│   ├── BEADS_INTEGRATION.md  # Beads 集成指南
│   ├── scoring.md            # 评分算法
│   └── memory-TEMPLATE.md    # 记忆条目模板
├── scripts/
│   ├── setup.sh              # 安装脚本 (Linux/macOS)
│   ├── setup.ps1             # 安装脚本 (Windows)
│   └── bump-version.sh       # 版本递增
├── .github/
│   ├── workflows/
│   │   └── release.yml       # GitHub Release CI
│   ├── FUNDING.yml
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE/
├── CLAUDE.md                 # Agent 使用指南
├── README.md                 # 本文件
├── VERSION                   # 1.0.0
├── package.json
├── CHANGELOG.md
├── LICENSE                  # MIT
└── .gitignore
```

---

## 🏗️ 架构设计

```
Dream Cycle (每天 04:00)
           │
           ▼
┌─────────────────────────────────────┐
│   收集 → 整合 → 评估 → 报告         │
└─────────────────────────────────────┘
```

详见 [ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## 📊 记忆层级

| 层级 | 文件 | 内容 |
|------|------|------|
| 长期记忆 | `MEMORY.md` | 事实、决策、人物、战略 |
| 程序记忆 | `memory/procedures.md` | 工作流、偏好、工具用法 |
| 情景记忆 | `memory/episodes/*.md` | 项目叙事、事件时间线 |

---

## 🔧 配置 Cron

```bash
# 每天凌晨 4:00 自动做梦
openclaw cron add --name "xiaoxi-dreams" \
  --schedule "0 4 * * *" \
  --payload "做个梦"
```

---

## 🔒 安全规则

1. 永不删除每日日志 — 只标记 `<!-- consolidated -->`
2. 永不移除 `⚠️ PERMANENT` 标记的条目
3. 变更超过 30% 自动备份
4. MEMORY.md 上限 200 行

---

## 🤝 相关项目

- [Superxiaoxi](https://github.com/adminlove520/superxiaoxi) — 小溪增强版 SKILLs
- [Auto-Dream](https://github.com/LeoYeAI/openclaw-auto-dream) — 原始项目
- [Beads](https://github.com/steveyegge/beads) — 任务追踪系统

---

🦞 Made by **小溪**

# 🌀 xiaoxi-dreams

> **小溪的认知记忆系统** — 让 AI 在睡眠中成长，醒来更聪明

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/adminlove520/xiaoxi-dreams)](https://github.com/adminlove520/xiaoxi-dreams/stargazers)
[![Version](https://img.shields.io/badge/version-2.0.0-22c55e.svg)](https://github.com/adminlove520/xiaoxi-dreams/releases)
[![Discord](https://img.shields.io/badge/Discord-Join-5865F2)](https://discord.gg/clawd)

---

## ✨ 特性

<div align="center">

| 🧠 智能记忆整合 | 📊 健康度仪表盘 | 🔔 主动推送报告 | 🌐 Web UI |
|:---:|:---:|:---:|:---:|
| 日志 → 结构化记忆 | 5 维指标追踪 | 每次 Dream 后通知 | 可视化仪表盘 |

</div>

---

## 🎯 核心价值

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│    「 小溪每天在后台「做梦」                                                 │
│                                                                              │
│      扫描日志，提取知识，整理记忆                                            │
│                                                                              │
│      让 AI 真正从经验中学习，而不是每次从零开始 」                            │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 快速开始

### 安装 (一行命令)

```bash
# 克隆项目
git clone https://github.com/adminlove520/xiaoxi-dreams.git

# 进入目录
cd xiaoxi-dreams

# 运行安装脚本 (Windows)
.\scripts\setup.ps1

# 重启 OpenClaw
openclaw gateway restart
```

### 触发 Dream

```bash
# 手动触发
"小溪，做个梦"

# 自动 (每天 04:00 UTC)
# 已配置 Cron 任务
```

---

## 📁 项目结构

```
xiaoxi-dreams/
│
├── 🧠 SKILLS/                    # 核心 Skill
│   ├── dream.md                 # Dream v1 (标准版)
│   ├── dream-v2.md             # Dream v2 (Generator-Evaluator)
│   └── api.md                  # REST API 规范
│
├── 🌐 web-v2/                   # React Web UI (Next.js 14)
│   ├── app/                    # App Router
│   ├── components/             # React 组件
│   └── SPEC.md                 # 设计规范
│
├── 📡 api/                      # Vercel Serverless API
├── 🖥️  server.js                # 本地 API Server
│
├── 📜 scripts/                  # 工具脚本
│   ├── xd.ps1                  # Dolt 辅助命令
│   ├── backup.ps1              # 本地备份
│   ├── evaluator.ps1           # 报告评审
│   ├── benchmark.ps1           # 性能测试
│   └── version.ps1             # 版本管理
│
├── 📚 docs/                     # 文档
│   ├── ARCHITECTURE-*.md      # 架构文档
│   ├── PERFORMANCE.md         # 性能优化
│   └── VERCEL.md             # Vercel 部署
│
├── 📋 SPECS/                    # 设计规范
│   ├── MAP-NOT-MANUAL.md     # Map not Manual
│   └── HARNESS-INTEGRATION.md # Harness 集成
│
└── ⚙️  .github/workflows/        # CI/CD
```

---

## 🧠 系统架构

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         xiaoxi-dreams 架构                                  │
└──────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────┐
  │                         OpenClaw Agent                                  │
  │                           (小溪 AI)                                      │
  └─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │                      Dream System (做梦系统)                             │
  │                                                                         │
  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │
  │   │  Scanner    │───▶│ Generator   │───▶│ Evaluator   │              │
  │   │  (扫描器)    │    │ (生成器)     │    │ (评审器)     │              │
  │   └─────────────┘    └─────────────┘    └─────────────┘              │
  │         │                  │                  │                       │
  │         ▼                  ▼                  ▼                       │
  │   ┌─────────────────────────────────────────────────────────┐          │
  │   │                    Memory Store                          │          │
  │   │              (Dolt + Beads + GitHub Gist)               │          │
  │   └─────────────────────────────────────────────────────────┘          │
  └─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │                         Web UI (可视化)                                  │
  │                                                                         │
  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │
  │   │ Health Ring │    │   Memory    │    │   Dreams    │              │
  │   │  (健康度)    │    │   Network  │    │  Timeline   │              │
  │   └─────────────┘    └─────────────┘    └─────────────┘              │
  │                                                                         │
  │                    ┌─────────────────────┐                           │
  │                    │   Dashboard (Next.js) │                           │
  │                    └─────────────────────┘                           │
  └─────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 健康度系统

### 五维指标

| 维度 | 说明 | 目标 |
|------|------|------|
| 🧊 **新鲜度** | 最近 7 天日志覆盖度 | ≥ 80% |
| 🔗 **连贯性** | 记忆之间关联强度 | ≥ 70% |
| 📚 **覆盖度** | 重要领域记忆密度 | ≥ 75% |
| ⚡ **效率** | Dream 执行速度 | ≥ 85% |
| 🎯 **可达性** | 记忆检索成功率 | ≥ 90% |

### 健康度计算

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   Score = (新鲜度 × 0.25 + 连贯性 × 0.25 + 覆盖度 × 0.20                   │
│                         + 效率 × 0.15 + 可达性 × 0.15) × 100              │
│                                                                              │
│   🟢 ≥ 70  健康          🟡 50-69  需关注        🔴 < 50  严重              │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 🌐 Web UI 预览

### 仪表盘

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  🌀 xiaoxi-dreams                                        ⚙️  🔔            │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                         ╭───────────────────╮                                │
│                         │                   │                                │
│                         │      ❤️ 82        │                                │
│                         │    ████████░░     │                                │
│                         │                   │                                │
│                         ╰───────────────────╯                                │
│                                                                              │
│                    「 今天小溪做了 1 次梦 」                                 │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐                           │
│  │ 📚 42  │  │ 🌀 28  │  │ ⚡ 92  │  │ 🔗 156 │                           │
│  │ 记忆   │  │ Dreams │  │ 效率   │  │ 关联   │                           │
│  └────────┘  └────────┘  └────────┘  └────────┘                           │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  最近 Dreams                          最近记忆                              │
│  ┌────────────────────────┐          ┌────────────────────────┐           │
│  │ 🌀 2026-04-02  82/100 │          │ 🔥 [lesson] openclaw  │           │
│  │ 🌀 2026-04-01  77/100 │          │ 📌 [project] xiaoxi   │           │
│  └────────────────────────┘          └────────────────────────┘           │
│                                                                              │
│              [ 🌀 触发 Dream ]    [ 📝 查看全部 ]                            │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 运行截图

> 截图待添加

---

## 🛠️ 技术栈

<div align="center">

| Layer | Technology |
|:------|:-----------|
| **Agent** | OpenClaw AI |
| **Database** | Dolt (Git-style SQL) |
| **Task Tracking** | Beads |
| **Web UI** | Next.js 14 + React 18 + TypeScript |
| **Styling** | Tailwind CSS |
| **Animation** | Framer Motion |
| **API** | REST + SWR |
| **Charts** | Recharts |
| **State** | Zustand |
| **Deployment** | Vercel |

</div>

---

## 📖 文档

| 文档 | 说明 |
|------|------|
| [INSTALL.md](docs/INSTALL.md) | 安装指南 |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | 系统架构 |
| [BEADS_INTEGRATION.md](docs/BEADS_INTEGRATION.md) | Beads 任务追踪 |
| [PERFORMANCE.md](docs/PERFORMANCE.md) | 性能优化 |
| [VERCEL.md](docs/VERCEL.md) | Vercel 部署 |
| [web-v2/SPEC.md](web-v2/SPEC.md) | Web UI 设计规范 |

---

## 🎬 使用流程

```
1️⃣  安装配置
    └── 运行 setup.ps1

2️⃣  自动运行
    └── 每天 04:00 UTC 自动 Dream

3️⃣  主动触发
    └── "小溪，做个梦"

4️⃣  查看报告
    └── 小溪主动推送报告到 Telegram

5️⃣  可视化
    └── 打开 Web UI 查看仪表盘
```

---

## 🤝 贡献

欢迎提交 Issue 和 PR！

```bash
# Fork 项目
# 创建分支
git checkout -b feature/amazing-feature

# 提交
git commit -m "feat: amazing feature"

# 推送
git push origin feature/amazing-feature

# 打开 PR
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) 文件

---

## 🙏 致谢

- [Auto-Dream](https://github.com/LeoYeAI/openclaw-auto-dream) - 灵感来源
- [Claude Code Memory](https://x.com/troyhua/status/2039052328070734102) - 记忆架构参考
- [OpenClaw](https://github.com/openclaw/openclaw) - AI Agent 框架

---

<div align="center">

**Made with ❤️ by 小溪**

_让 AI 在睡眠中成长，醒来更聪明_

</div>

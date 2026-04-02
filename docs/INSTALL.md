# 安装指南

## 环境要求

- **OpenClaw** 2026.3.0+
- **Git**
- **PowerShell 7+** 或 **Bash**

## 安装方式

### 方式一：一键安装（推荐）

```bash
git clone https://github.com/adminlove520/xiaoxi-dreams.git
cd xiaoxi-dreams
./scripts/setup.sh
openclaw gateway restart
```

### 方式二：手动安装

#### 1. 克隆仓库

```bash
git clone https://github.com/adminlove520/xiaoxi-dreams.git \
  ~/.openclaw/workspace/xiaoxi-dreams
```

#### 2. 安装 SKILL

```bash
mkdir -p ~/.openclaw/skills
cp -r ~/.openclaw/workspace/xiaoxi-dreams/SKILLS/* ~/.openclaw/skills/
```

#### 3. 创建必要目录

```bash
mkdir -p ~/.openclaw/workspace/memory/episodes
mkdir -p ~/.openclaw/workspace/memory/logs
```

#### 4. 重启 OpenClaw

```bash
openclaw gateway restart
```

## 验证安装

```bash
# 手动触发 Dream
"做个梦"
```

你应该看到类似输出：

```
🌀 开始做梦...

📊 扫描: 7 文件
🧠 健康度: 75/100
✅ 完成！
```

## 配置 Cron 自动运行

```bash
# 每天凌晨 4:00 自动做梦
openclaw cron add --name "xiaoxi-dreams" \
  --schedule "0 4 * * *" \
  --payload "做个梦"
```

或通过 Gateway 工具配置：

```json
{
  "name": "xiaoxi-dreams",
  "schedule": { "kind": "cron", "expr": "0 4 * * *", "tz": "Asia/Shanghai" },
  "payload": { "kind": "agentTurn", "message": "做个梦" },
  "sessionTarget": "isolated",
  "delivery": { "mode": "announce", "channel": "telegram" }
}
```

**推荐 schedule：**
- `0 4 * * *` — 每天凌晨 4:00（哥哥睡觉时）
- `0 6 * * *` — 每天早上 6:00（哥哥起床前）
- `0 */4 * * *` — 每 4 小时

## 更新

```bash
cd ~/.openclaw/workspace/xiaoxi-dreams
git pull
./scripts/setup.sh
```

## 卸载

```bash
rm ~/.openclaw/skills/dream.md
rm -rf ~/.openclaw/workspace/xiaoxi-dreams
```

## 下一步

- 阅读 [ARCHITECTURE.md](ARCHITECTURE.md) 了解架构设计
- 阅读 [WORKFLOW.md](WORKFLOW.md) 了解工作流程

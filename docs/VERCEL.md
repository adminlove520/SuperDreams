# 🚀 Vercel 部署指南

## 部署架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Vercel 部署架构                                    │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────┐
  │                      Vercel Cloud                                   │
  │  ┌───────────────────────────────────────────────────────────┐  │
  │  │  Web UI (Static)                                         │  │
  │  │  ├── https://xiaoxi-dreams.vercel.app                   │  │
  │  │  └── CDN, HTTPS, 全球加速                               │  │
  │  └───────────────────────────────────────────────────────────┘  │
  │  ┌───────────────────────────────────────────────────────────┐  │
  │  │  API Functions (Serverless)                             │  │
  │  │  └── /api/* → Lambda Functions                        │  │
  │  └───────────────────────────────────────────────────────────┘  │
  └─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │                      Local Machine                              │
  │  ┌───────────────────────────────────────────────────────────┐  │
  │  │  Dolt Server (127.0.0.1:57823)                         │  │
  │  │  - 本地数据库                                            │  │
  │  │  - 数据权威源                                           │  │
  │  └───────────────────────────────────────────────────────────┘  │
  │  ┌───────────────────────────────────────────────────────────┐  │
  │  │  GitHub Gist (KV Store)                                 │  │
  │  │  - 健康度缓存                                            │  │
  │  │  - 记忆索引                                             │  │
  │  │  - 轻量同步                                             │  │
  │  └───────────────────────────────────────────────────────────┘  │
  └─────────────────────────────────────────────────────────────────┘
```

## 部署步骤

### 1. 准备环境

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login
```

### 2. 配置环境变量

在 Vercel Dashboard 添加：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `API_KEY` | API 密钥 | `your-secret-key` |
| `GIST_ID` | GitHub Gist ID | `xxxxxxx` |
| `GITHUB_TOKEN` | GitHub Token | `ghp_xxxx` |

### 3. 创建 GitHub Gist

```bash
# 创建一个 Gist 用于存储数据
# 访问: https://gist.github.com/
# 创建文件: xiaoxi-dreams.json
# 内容: {"health": {}, "memories": [], "dreams": []}
```

### 4. 部署

```bash
# 进入项目目录
cd xiaoxi-dreams

# 部署预览
vercel

# 部署生产
vercel --prod
```

### 5. 配置域名 (可选)

```bash
# 添加自定义域名
vercel domains add xiaoxi-dreams.vercel.app
```

## 本地数据同步

由于 Vercel Serverless 无法访问本地 Dolt，需要同步：

```bash
# 同步数据到 GitHub Gist
.\sync-gist.ps1

# 这会将本地健康度和记忆索引同步到 Gist
```

## 更新 Web UI 配置

编辑 `web/index.html`，更新 API 地址：

```javascript
const API_BASE = 'https://xiaoxi-dreams.vercel.app/api';
```

## 部署后访问

```
Web UI: https://xiaoxi-dreams.vercel.app
API:   https://xiaoxi-dreams.vercel.app/api/health
```

## 成本

| 服务 | 用量 | 成本 |
|------|------|------|
| Vercel (Hobby) | 100GB 带宽 | 免费 |
| GitHub Gist | 存储 | 免费 |
| **总计** | | **免费** |

## 局限性

```
⚠️ Serverless 限制:
├── 无法直接访问本地 Dolt 数据库
├── 数据需要同步到 GitHub Gist
├── 实时性取决于同步频率
└── 不适合高频写入
```

## 替代方案：纯本地部署

如果 Serverless 限制太多，可以：

```bash
# 本地运行 Web + API
npm start

# 访问
http://localhost:18792
```

## 定时同步 Cron

可以用 GitHub Actions 定时同步：

```yaml
# .github/workflows/sync-gist.yml
name: Sync to Gist
on:
  schedule:
    - cron: '0 */4 * * *'  # 每4小时
  workflow_dispatch:
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Sync to Gist
        run: ./scripts/sync-gist.sh
        env:
          GIST_ID: ${{ secrets.GIST_ID }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

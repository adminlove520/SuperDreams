---
name: api
description: "REST API 服务 — 健康度查询、记忆管理、Dream 触发。触发词：启动API、api服务"
---

# 🌐 SuperDreams REST API

## 快速开始

SuperDreams 提供了基于 Next.js API Routes 的 REST 接口。

```bash
# Agent Dashboard API (默认端口 3000)
http://localhost:3000/api/health
http://localhost:3000/api/memories

# Control Center API (默认端口 3001)
http://localhost:3001/api/agents
```

## 认证

所有跨服务请求需携带 API Key 或 JWT Token。

```
Header: Authorization: Bearer <your-jwt-token>
或
Header: X-API-Key: <your-api-key>
```

## 端点 (Agent)

### GET /api/health

查询当前 Agent 的健康度状态。

```bash
curl http://localhost:3000/api/health
```

响应：
```json
{
  "score": 82,
  "status": "healthy",
  "dimensions": {
    "freshness": 0.75,
    "coverage": 0.80,
    "coherence": 0.72,
    "efficiency": 0.85,
    "accessibility": 0.78
  },
  "date": "2026-04-02",
  "trend": "up"
}
```

### GET /api/memories

记忆列表搜索与过滤。

```bash
curl http://localhost:3000/api/memories?type=lesson&limit=10
```

### POST /api/dreams

触发一次做梦流程。

```bash
curl -X POST http://localhost:3000/api/dreams
```

## 状态码

| 状态 | 说明 |
|------|------|
| 200 | 成功 |
| 401 | 未授权 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

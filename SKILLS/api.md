---
name: api
description: "REST API 服务 — 健康度查询、记忆管理、Dream 触发。触发词：启动API、api服务"
---

# 🌐 xiaoxi-dreams REST API

## 快速开始

```bash
# 启动 API
xiaoxi-api

# 访问
curl http://localhost:18792/health
curl http://localhost:18792/memories
```

## 认证

```
Header: X-API-Key: <your-api-key>
```

## 端点

### GET /health

健康度查询（最常用）

```bash
curl http://localhost:18792/health \
  -H "X-API-Key: your-key"
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

### GET /health/history

健康度历史

```bash
curl http://localhost:18792/health/history?days=7
```

### GET /memories

记忆列表

```bash
curl http://localhost:18792/memories?type=lesson&limit=10
```

响应：
```json
{
  "memories": [
    {
      "id": "mem_001",
      "type": "lesson",
      "name": "openclaw-config-set",
      "summary": "使用 openclaw config set 安全修改配置",
      "importance": 8,
      "tags": ["openclaw", "config"],
      "created_at": "2026-04-02"
    }
  ],
  "total": 42,
  "page": 1
}
```

### GET /memories/:id

记忆详情

```bash
curl http://localhost:18792/memories/mem_001
```

### GET /dreams/history

Dream 历史

```bash
curl http://localhost:18792/dreams/history?limit=5
```

### POST /dreams/trigger

触发 Dream

```bash
curl -X POST http://localhost:18792/dreams/trigger \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{"mode": "standard", "days": 7}'
```

### GET /stats

统计信息

```bash
curl http://localhost:18792/stats
```

## 状态码

| 状态 | 说明 |
|------|------|
| 200 | 成功 |
| 400 | 请求错误 |
| 401 | 未授权 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

## 错误响应

```json
{
  "error": {
    "code": "MEMORY_NOT_FOUND",
    "message": "记忆 mem_xxx 不存在"
  }
}
```

## 配置

```yaml
# api.yaml
host: "0.0.0.0"
port: 18792
api_key: "your-secret-key"
cors: true
```

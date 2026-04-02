# 记忆条目模板

> 用于创建新的记忆条目

```markdown
---
name: [short-name]
type: [fact|decision|lesson|procedure|person|project]
created: YYYY-MM-DD
updated: YYYY-MM-DD
importance: [1-10]
tags: [tag1, tag2]
---

## 概要

[一句话描述]

## 详情

[详细描述]

## 来源

- 日期：YYYY-MM-DD
- 场景：[在什么情况下记录的]

## 相关记忆

- [mem_xxx]
- [procedures_xxx]
```

## 使用示例

```markdown
---
name: exec-config-security
type: procedure
created: 2026-04-02
updated: 2026-04-02
importance: 8
tags: [openclaw, security, exec]
---

## 概要

使用 `openclaw config set` 安全修改配置

## 详情

`openclaw config set` 会自动创建 .bak 备份，比手动编辑更安全。
不要手动编辑 openclaw.json，可能导致 Gateway 崩溃。

## 来源

- 日期：2026-04-02
- 场景：修复 exec allowlist 被升级覆盖问题

## 相关

- [mem_openclaw_version_upgrade]
```

#!/bin/bash
# xiaoxi-dreams 安装脚本 (Linux/macOS)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🌀 安装 xiaoxi-dreams..."

# 创建必要目录
mkdir -p "$PROJECT_DIR/memory/episodes"
mkdir -p "$PROJECT_DIR/docs"
mkdir -p "$HOME/.openclaw/workspace/memory/episodes"
mkdir -p "$HOME/.openclaw/workspace/memory/logs"

# 创建 index.json（如不存在）
if [ ! -f "$HOME/.openclaw/workspace/memory/index.json" ]; then
    cat > "$HOME/.openclaw/workspace/memory/index.json" << 'EOF'
{
  "version": "1.0",
  "lastDream": null,
  "health": 0,
  "dreamCount": 0
}
EOF
    echo "创建 index.json..."
fi

# 创建 MEMORY.md（如不存在）
if [ ! -f "$HOME/.openclaw/workspace/MEMORY.md" ]; then
    cat > "$HOME/.openclaw/workspace/MEMORY.md" << 'EOF'
# MEMORY.md

> 小溪的长期记忆索引

<!-- 自动生成，每行一个记忆条目 -->
EOF
    echo "创建 MEMORY.md..."
fi

echo ""
echo "✅ 安装完成！"
echo ""
echo "下一步："
echo "1. 重启 Gateway: openclaw gateway restart"
echo "2. 手动触发 Dream: '做个梦'"
echo "3. 或设置 cron: openclaw cron add ..."

#!/bin/bash
# 版本号递增脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$PROJECT_DIR/.version-bump.json"

# 读取当前版本
CURRENT_VERSION=$(cat "$PROJECT_DIR/VERSION")

# 解析版本号
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR="${VERSION_PARTS[0]}"
MINOR="${VERSION_PARTS[1]}"
PATCH="${VERSION_PARTS[2]}"

# 默认递增 patch
BUMP_TYPE="${1:-patch}"

case "$BUMP_TYPE" in
  major)
    MAJOR=$((MAJOR + 1))
    MINOR=0
    PATCH=0
    ;;
  minor)
    MINOR=$((MINOR + 1))
    PATCH=0
    ;;
  patch)
    PATCH=$((PATCH + 1))
    ;;
  *)
    echo "用法: ./bump-version.sh [major|minor|patch]"
    exit 1
    ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"

# 更新 VERSION
echo "$NEW_VERSION" > "$PROJECT_DIR/VERSION"

# 更新 package.json
if [ -f "$PROJECT_DIR/package.json" ]; then
  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('$PROJECT_DIR/package.json', 'utf8'));
    pkg.version = '$NEW_VERSION';
    fs.writeFileSync('$PROJECT_DIR/package.json', JSON.stringify(pkg, null, 2) + '\n');
  "
fi

echo "版本: $CURRENT_VERSION → $NEW_VERSION"
echo "记得提交并打标签: git add -A && git commit -m 'v$NEW_VERSION' && git tag v$NEW_VERSION"

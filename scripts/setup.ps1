# xiaoxi-dreams 安装脚本 (PowerShell)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir

Write-Host "🌀 安装 xiaoxi-dreams..." -ForegroundColor Cyan

# 创建必要目录
$MemoryDir = "$env:USERPROFILE\.openclaw\workspace\memory"
$EpisodesDir = "$MemoryDir\episodes"
$LogsDir = "$MemoryDir\logs"

if (!(Test-Path $MemoryDir)) {
    Write-Host "创建 memory 目录..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $MemoryDir | Out-Null
}

New-Item -ItemType Directory -Force -Path $EpisodesDir | Out-Null
New-Item -ItemType Directory -Force -Path $LogsDir | Out-Null

# 创建 index.json（如不存在）
$IndexFile = "$MemoryDir\index.json"
if (!(Test-Path $IndexFile)) {
    @{
        version = "1.0"
        lastDream = $null
        health = 0
        dreamCount = 0
    } | ConvertTo-Json | Set-Content $IndexFile
    Write-Host "创建 index.json..." -ForegroundColor Yellow
}

# 创建 MEMORY.md（如不存在）
$MemoryMd = "$env:USERPROFILE\.openclaw\workspace\MEMORY.md"
if (!(Test-Path $MemoryMd)) {
    "# MEMORY.md`n`n> 小溪的长期记忆索引`n" | Set-Content $MemoryMd
    Write-Host "创建 MEMORY.md..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ 安装完成！" -ForegroundColor Green
Write-Host ""
Write-Host "下一步：" -ForegroundColor Cyan
Write-Host "1. 重启 Gateway: openclaw gateway restart"
Write-Host "2. 手动触发 Dream: '做个梦'"
Write-Host "3. 或设置 cron: openclaw cron add ..."

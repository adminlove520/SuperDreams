'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Moon, Sparkles, Settings, Bell,
  RefreshCw, AlertCircle, Brain, X,
  ExternalLink
} from 'lucide-react'
import HealthRing from '@/components/HealthRing'
import StatsGrid from '@/components/StatsGrid'
import RecentMemories from '@/components/RecentMemories'
import RecentDreams from '@/components/RecentDreams'
import SyncSettings from '@/components/SyncSettings'
import type { Health, Stats, Memory, Dream } from '@/lib/types'

// ========== API ==========
async function fetchApi<T>(endpoint: string): Promise<T> {
  const res = await fetch(endpoint)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// ========== Helpers ==========
function LoadingSpinner({ text = '加载中...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <RefreshCw className="w-8 h-8 text-zinc-500 animate-spin" />
      <span className="text-zinc-400">{text}</span>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
      <AlertCircle className="w-10 h-10 text-zinc-600" />
      <p className="text-zinc-400">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm">
          重试
        </button>
      )}
    </div>
  )
}

// ========== Dropdown ==========
function useClickOutside(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onClose])
}

// ========== Main Page ==========
export default function Home() {
  const [health, setHealth] = useState<Health | null>(null)
  const [memories, setMemories] = useState<Memory[]>([])
  const [dreams, setDreams] = useState<Dream[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dreaming, setDreaming] = useState(false)

  // Panels
  const [showNotif, setShowNotif] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)
  useClickOutside(notifRef, () => setShowNotif(false))
  useClickOutside(settingsRef, () => setShowSettings(false))

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [h, mData, dData, s] = await Promise.all([
        fetchApi<Health>('/api/health'),
        fetchApi<{ memories: Memory[] }>('/api/memories?limit=5'),
        fetchApi<{ dreams: Dream[] }>('/api/dreams?limit=5'),
        fetchApi<Stats>('/api/stats'),
      ])
      setHealth(h)
      setMemories(mData.memories)
      setDreams(dData.dreams)
      setStats(s)
    } catch (e: any) {
      setError(e.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  async function triggerDream() {
    setDreaming(true)
    try {
      await fetch('/api/dreams', { method: 'POST' })
      await new Promise(r => setTimeout(r, 2500))
      await loadData()
    } catch (e) {
      console.error('Dream failed:', e)
    } finally {
      setDreaming(false)
    }
  }

  useEffect(() => { loadData() }, [])

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center shadow-lg shadow-green-500/20">
              <Moon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-lg text-zinc-100 tracking-tight">SuperDreams</h1>
              <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Cognitive Core v4.0</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Notification Button */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setShowNotif(!showNotif); setShowSettings(false) }}
                className="p-2 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-zinc-100 relative"
              >
                <Bell className="w-5 h-5" />
                {dreams.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
                )}
              </button>
              {showNotif && (
                <div className="absolute right-0 top-12 w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                    <span className="font-semibold text-sm">通知</span>
                    <button onClick={() => setShowNotif(false)} className="text-zinc-500 hover:text-zinc-300">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {dreams.length === 0 ? (
                      <div className="px-4 py-6 text-center text-zinc-500 text-sm">暂无通知</div>
                    ) : (
                      dreams.slice(0, 5).map((d) => (
                        <div key={d.id} className="px-4 py-3 border-b border-zinc-800/50 hover:bg-zinc-800/50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">
                              {d.status === 'completed' ? '🌙 梦境完成' : d.status === 'failed' ? '❌ 梦境失败' : '⏳ 进行中'}
                            </span>
                            <span className="text-[10px] text-zinc-600">{d.date}</span>
                          </div>
                          <p className="text-xs text-zinc-400">
                            扫描 {d.scanned_files} 个文件, 新增 {d.new_entries} 条记忆, 健康度 {d.health_score}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <a href="/dreams" className="block px-4 py-2.5 text-center text-xs text-green-400 hover:bg-zinc-800/50 border-t border-zinc-800">
                    查看全部梦境记录 →
                  </a>
                </div>
              )}
            </div>

            {/* Settings Button */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => { setShowSettings(!showSettings); setShowNotif(false) }}
                className="p-2 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-zinc-100"
              >
                <Settings className="w-5 h-5" />
              </button>
              {showSettings && (
                <div className="absolute right-0 top-12 w-64 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-zinc-800">
                    <span className="font-semibold text-sm">设置</span>
                  </div>
                  <div className="py-1">
                    <a href="/memories" className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/50 text-sm text-zinc-300">
                      <Brain className="w-4 h-4 text-purple-400" />
                      记忆管理
                    </a>
                    <a href="/dreams" className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/50 text-sm text-zinc-300">
                      <Moon className="w-4 h-4 text-blue-400" />
                      梦境记录
                    </a>
                    <button
                      onClick={() => { loadData(); setShowSettings(false) }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/50 text-sm text-zinc-300 w-full text-left"
                    >
                      <RefreshCw className="w-4 h-4 text-green-400" />
                      刷新数据
                    </button>
                    <a
                      href="https://github.com/adminlove520/SuperDreams"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/50 text-sm text-zinc-300"
                    >
                      <ExternalLink className="w-4 h-4 text-zinc-500" />
                      GitHub
                    </a>
                  </div>
                  <div className="px-4 py-3 border-t border-zinc-800">
                    <p className="text-[10px] text-zinc-600">SuperDreams v4.0.0</p>
                    <p className="text-[10px] text-zinc-600">Agent Dashboard (sql.js)</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold mb-6 border border-green-500/20">
            <Brain className="w-3.5 h-3.5" />
            AI 驱动的认知记忆系统
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-blue-500 bg-clip-text text-transparent">
              让记忆被看见。
            </span>
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            SuperDreams 每天在后台「做梦」，整理记忆碎片，计算认知健康度，追踪你的成长轨迹。
          </p>
        </motion.div>

        {/* Trigger Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center"
        >
          <button
            onClick={triggerDream}
            disabled={dreaming}
            className="group px-8 py-3 bg-white text-zinc-950 hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-white/5 transition-all active:scale-95"
          >
            <Sparkles className={`w-5 h-5 ${dreaming ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`} />
            {dreaming ? '正在重塑认知...' : '触发核心做梦记录'}
          </button>
        </motion.div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : (
          <div className="space-y-6">
            {/* Top Grid: Health, Stats, Sync */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                {health && <HealthRing health={health} />}
              </div>
              <div className="lg:col-span-1">
                {stats && <StatsGrid stats={stats} />}
              </div>
              <div className="lg:col-span-1">
                <SyncSettings />
              </div>
            </div>

            {/* Bottom Grid: Recent Activities */}
            <div className="grid md:grid-cols-2 gap-6">
              <RecentDreams dreams={dreams} />
              <RecentMemories memories={memories} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 py-12 text-center border-t border-zinc-900 mt-12">
        <p className="text-zinc-500 text-xs font-medium tracking-widest uppercase mb-2">SuperDreams 4.0</p>
        <p className="text-zinc-600 text-[10px]">由龙虾驱动的认知计算引擎</p>
      </footer>
    </div>
  )
}

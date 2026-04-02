'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Filter, ArrowLeft, RefreshCw, 
  AlertCircle, Moon, Eye, X, Tag, Clock,
  Star, Hash
} from 'lucide-react'
import Link from 'next/link'
import type { Memory } from '@/lib/types'

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/memories?limit=100${typeFilter !== 'all' ? `&type=${typeFilter}` : ''}`)
      if (!res.ok) throw new Error('Failed to fetch memories')
      const data = await res.json()
      setMemories(data.memories)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [typeFilter])

  const filteredMemories = memories.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.summary.toLowerCase().includes(search.toLowerCase()) ||
    m.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  )

  const typeColors: Record<string, string> = {
    lesson: '#eab308',
    decision: '#22c55e',
    fact: '#3b82f6',
    project: '#8b5cf6',
    procedure: '#06b6d4',
    person: '#f97316',
  }

  const typeLabels: Record<string, string> = {
    lesson: '教训',
    decision: '决策',
    fact: '事实',
    project: '项目',
    procedure: '流程',
    person: '人物',
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-semibold text-lg">SuperDreams 记忆库</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span>{filteredMemories.length} 条记忆</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="搜索记忆名称、摘要或标签..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-green-500 transition-colors"
            >
              <option value="all">所有类型</option>
              <option value="lesson">教训</option>
              <option value="decision">决策</option>
              <option value="fact">事实</option>
              <option value="project">项目</option>
              <option value="procedure">流程</option>
              <option value="person">人物</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-zinc-500 animate-spin mb-4" />
            <p className="text-zinc-500">同步神经元...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400">{error}</p>
            <button onClick={loadData} className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm">
              重试
            </button>
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            没有找到相关记忆
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredMemories.map((mem, i) => (
              <motion.div
                key={mem.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedMemory(mem)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: typeColors[mem.type] || '#71717a' }}
                      />
                      <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{mem.type}</span>
                      {mem.importance >= 8 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-red-500/10 text-red-500 rounded border border-red-500/20">HIGH PRIORITY</span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-100 mb-2 group-hover:text-green-400 transition-colors">{mem.name}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed mb-4 line-clamp-2">{mem.summary}</p>
                    <div className="flex flex-wrap gap-2">
                      {mem.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-1 bg-zinc-800 text-zinc-500 rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button 
                    className="p-2 text-zinc-600 hover:text-green-400 transition-colors opacity-0 group-hover:opacity-100"
                    title="查看详情"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Memory Detail Modal */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedMemory(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: typeColors[selectedMemory.type] || '#71717a' }}
                  />
                  <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                    {typeLabels[selectedMemory.type] || selectedMemory.type}
                  </span>
                  {selectedMemory.importance >= 8 && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-red-500/10 text-red-500 rounded border border-red-500/20 flex items-center gap-1">
                      <Star className="w-2.5 h-2.5" />
                      HIGH PRIORITY
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedMemory(null)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-zinc-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-8rem)]">
                <h2 className="text-2xl font-bold text-zinc-100 mb-4">{selectedMemory.name}</h2>
                
                <div className="space-y-6">
                  {/* Summary */}
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-2">
                      <Hash className="w-3 h-3" />
                      摘要
                    </h3>
                    <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950/50 rounded-xl p-4 border border-zinc-800/50">
                      {selectedMemory.summary}
                    </p>
                  </div>

                  {/* Meta Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800/50">
                      <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-2">
                        <Star className="w-3 h-3" />
                        重要度
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-zinc-100">{selectedMemory.importance}</div>
                        <div className="text-xs text-zinc-500">/ 10</div>
                        <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden ml-2">
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ 
                              width: `${selectedMemory.importance * 10}%`,
                              backgroundColor: selectedMemory.importance >= 8 ? '#ef4444' : selectedMemory.importance >= 5 ? '#eab308' : '#22c55e'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800/50">
                      <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        记录时间
                      </h3>
                      <div className="text-sm text-zinc-300 font-mono">
                        {selectedMemory.created_at ? new Date(selectedMemory.created_at).toLocaleString('zh-CN') : '未知'}
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedMemory.tags.length > 0 && (
                    <div>
                      <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-2">
                        <Tag className="w-3 h-3" />
                        标签
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedMemory.tags.map(tag => (
                          <span 
                            key={tag}
                            className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-sm border border-zinc-700/50 hover:border-green-500/30 hover:text-green-400 transition-colors cursor-default"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ID */}
                  <div className="pt-4 border-t border-zinc-800/50">
                    <p className="text-[10px] text-zinc-600 font-mono">Memory ID: {selectedMemory.id}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

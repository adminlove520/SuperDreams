'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Memory } from '@/lib/types'

const TYPE_COLORS: Record<string, string> = {
  lesson: '#fbbf24',
  decision: '#4ade80',
  fact: '#60a5fa',
  project: '#c084fc',
  procedure: '#22d3ee',
  person: '#fb923c',
}

export default function RecentMemories({ memories }: { memories: Memory[] }) {
  const router = useRouter()

  return (
    <div className="neon-card-purple p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-bright">最近记忆</h2>
        <Link href="/memories" className="text-xs text-dim hover:text-purple-400 transition-colors font-mono">
          查看全部 →
        </Link>
      </div>
      {memories.length === 0 ? (
        <p className="text-muted text-center py-6 text-sm">暂无记忆</p>
      ) : (
        <div className="space-y-3">
          {memories.map((mem) => (
            <div
              key={mem.id}
              onClick={() => router.push('/memories')}
              className="flex gap-3 p-3 bg-zinc-900/40 rounded-xl hover:bg-zinc-800/50 transition-all group cursor-pointer border border-transparent hover:border-purple-500/20"
            >
              <div
                className="w-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: TYPE_COLORS[mem.type] || '#71717a', boxShadow: `0 0 6px ${TYPE_COLORS[mem.type] || '#71717a'}50` }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 bg-zinc-800/80 rounded text-dim border border-zinc-700/40 font-mono">{mem.type}</span>
                  {mem.importance >= 8 && (
                    <span className="text-xs px-2 py-0.5 bg-red-500/10 text-red-400 rounded border border-red-500/20">重要</span>
                  )}
                </div>
                <p className="text-sm text-bright font-semibold truncate group-hover:text-purple-300 transition-colors">{mem.name}</p>
                <p className="text-xs text-dim truncate mt-1">{mem.summary}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import { Cloud } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Dream } from '@/lib/types'

export default function RecentDreams({ dreams }: { dreams: Dream[] }) {
  const router = useRouter()

  return (
    <div className="neon-card-blue p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-bright">最近 Dreams</h2>
        <Link href="/dreams" className="text-xs text-dim hover:text-blue-400 transition-colors font-mono">
          历史记录 →
        </Link>
      </div>
      {dreams.length === 0 ? (
        <p className="text-muted text-center py-6 text-sm">暂无 Dream</p>
      ) : (
        <div className="space-y-3">
          {dreams.map((dream) => (
            <div
              key={dream.id}
              onClick={() => router.push('/dreams')}
              className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-xl hover:bg-zinc-800/50 transition-all cursor-pointer group border border-transparent hover:border-blue-500/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <Cloud className="w-5 h-5 text-blue-400" style={{ filter: 'drop-shadow(0 0 4px rgba(59,130,246,0.5))' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-bright group-hover:neon-text-blue transition-all">{dream.date}</p>
                  <p className="text-xs text-dim">+{dream.new_entries} 记忆</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-extrabold font-mono stat-value-green">{dream.health_score}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

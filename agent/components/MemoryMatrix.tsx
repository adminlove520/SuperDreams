'use client'

import { motion } from 'framer-motion'
import { Database, Layers } from 'lucide-react'

interface MemoryMatrixProps {
  typeDistribution: Record<string, number>
  totalMemories: number
}

const TYPE_META: Record<string, { label: string; color: string; glow: string }> = {
  lesson:    { label: '教训', color: '#fbbf24', glow: 'rgba(234,179,8,0.4)' },
  decision:  { label: '决策', color: '#4ade80', glow: 'rgba(34,197,94,0.4)' },
  fact:      { label: '事实', color: '#60a5fa', glow: 'rgba(59,130,246,0.4)' },
  project:   { label: '项目', color: '#c084fc', glow: 'rgba(168,85,247,0.4)' },
  procedure: { label: '流程', color: '#22d3ee', glow: 'rgba(6,182,212,0.4)' },
  person:    { label: '人物', color: '#fb923c', glow: 'rgba(249,115,22,0.4)' },
}

export default function MemoryMatrix({ typeDistribution, totalMemories }: MemoryMatrixProps) {
  const entries = Object.entries(typeDistribution).sort((a, b) => b[1] - a[1])
  const maxCount = Math.max(...entries.map(([, c]) => c), 1)

  return (
    <div className="neon-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-green-400" style={{ filter: 'drop-shadow(0 0 4px rgba(34,197,94,0.5))' }} />
          <h3 className="font-bold text-bright">记忆矩阵</h3>
        </div>
        <span className="text-xs text-dim font-mono">
          共 <span className="stat-value-green font-semibold">{totalMemories}</span> 条
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8">
          <Database className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
          <p className="text-muted text-sm">暂无记忆数据</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(([type, count], i) => {
            const meta = TYPE_META[type] || { label: type, color: '#71717a', glow: 'rgba(113,113,122,0.3)' }
            const pct = totalMemories > 0 ? ((count / totalMemories) * 100).toFixed(1) : '0'
            const barWidth = (count / maxCount) * 100

            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: meta.color, boxShadow: `0 0 6px ${meta.glow}` }}
                    />
                    <span className="text-sm text-medium font-medium">{meta.label}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-dim">{pct}%</span>
                    <span className="font-semibold" style={{ color: meta.color, textShadow: `0 0 4px ${meta.glow}` }}>
                      {count}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-zinc-900/80 rounded-full overflow-hidden border border-zinc-800/30">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.8, delay: i * 0.05, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: meta.color,
                      boxShadow: `0 0 8px ${meta.glow}, 0 0 16px ${meta.glow.replace('0.4', '0.15')}`,
                    }}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

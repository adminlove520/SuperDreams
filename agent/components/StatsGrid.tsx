'use client'

import { motion } from 'framer-motion'
import { BookOpen, Cloud, TrendingUp, Link2 } from 'lucide-react'
import type { Stats } from '@/lib/types'

const ITEMS = [
  { key: 'memories' as const, label: '记忆总数', icon: BookOpen, color: '#4ade80', glowClass: 'stat-value-green' },
  { key: 'dreams' as const, label: 'Dream 次数', icon: Cloud, color: '#60a5fa', glowClass: 'stat-value-blue' },
  { key: 'avgHealth' as const, label: '平均健康度', icon: TrendingUp, color: '#fbbf24', suffix: '%', glowClass: 'stat-value-yellow' },
  { key: 'connections' as const, label: '标签关联', icon: Link2, color: '#fb923c', glowClass: 'stat-value-orange' },
]

export default function StatsGrid({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {ITEMS.map((item, i) => (
        <motion.div
          key={item.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="neon-card p-4 text-center group"
        >
          <item.icon className="w-7 h-7 mx-auto mb-2 transition-transform group-hover:scale-110" style={{ color: item.color, filter: `drop-shadow(0 0 6px ${item.color}60)` }} />
          <div className={`text-2xl font-extrabold font-mono mb-1 ${item.glowClass}`}>
            {stats[item.key]}{item.suffix || ''}
          </div>
          <div className="text-xs text-dim font-medium">{item.label}</div>
        </motion.div>
      ))}
    </div>
  )
}

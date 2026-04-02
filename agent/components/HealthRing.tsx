'use client'

import { motion } from 'framer-motion'
import type { Health } from '@/lib/types'

const STATUS_COLORS: Record<string, string> = {
  healthy: '#4ade80',
  warning: '#fbbf24',
  critical: '#f87171',
  unknown: '#71717a',
}

const STATUS_GLOW: Record<string, string> = {
  healthy: 'rgba(34,197,94,0.4)',
  warning: 'rgba(234,179,8,0.4)',
  critical: 'rgba(239,68,68,0.4)',
  unknown: 'rgba(113,113,122,0.2)',
}

const STATUS_LABELS: Record<string, string> = {
  healthy: '健康',
  warning: '注意',
  critical: '告警',
  unknown: '未知',
}

const DIM_LABELS: Record<string, string> = {
  freshness: '新鲜度',
  coverage: '覆盖度',
  coherence: '连贯度',
  efficiency: '效率',
  accessibility: '可达性',
}

export default function HealthRing({ health }: { health: Health }) {
  const circumference = 2 * Math.PI * 80
  const offset = circumference - (health.score / 100) * circumference
  const color = STATUS_COLORS[health.status] || STATUS_COLORS.unknown
  const glow = STATUS_GLOW[health.status] || STATUS_GLOW.unknown

  return (
    <div className="neon-card p-6 text-center">
      <h2 className="text-lg font-bold text-bright mb-6 flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full sync-pulse" style={{ backgroundColor: color }} />
        健康度
      </h2>

      <div className="relative inline-block mb-6">
        <svg className="w-48 h-48 -rotate-90" style={{ filter: `drop-shadow(0 0 12px ${glow})` }}>
          <circle cx="96" cy="96" r="80" fill="none" stroke="#1c1c24" strokeWidth="10" />
          <motion.circle
            cx="96" cy="96" r="80" fill="none"
            stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-extrabold font-mono" style={{ color, textShadow: `0 0 12px ${glow}` }}>
            {health.score}
          </span>
          <span className="text-dim text-sm font-mono">/ 100</span>
        </div>
      </div>

      <div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
        style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30` }}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: color }} />
        </span>
        {STATUS_LABELS[health.status] || '未知'}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-6">
        {Object.entries(health.dimensions || {}).map(([key, value]) => (
          <div key={key} className="flex justify-between px-3 py-2.5 bg-zinc-900/60 rounded-lg text-sm border border-zinc-800/40">
            <span className="text-dim">{DIM_LABELS[key] || key}</span>
            <span className="stat-value-green font-mono font-semibold">{((value as number) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { BookOpen, Cloud, Zap, Link2, RefreshCw, AlertCircle } from 'lucide-react'
import { useStats } from '@/lib/hooks'
import { Card } from '../ui/card'

function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  color,
  delay,
  isLoading
}: { 
  label: string
  value: number | string
  icon: React.ElementType
  color: string
  delay: number
  isLoading?: boolean
}) {
  if (isLoading) {
    return (
      <Card className="text-center py-6 bg-zinc-900 border-zinc-800">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-zinc-800 animate-pulse" />
        <div className="h-8 w-16 mx-auto bg-zinc-800 rounded animate-pulse mb-2" />
        <div className="h-4 w-12 mx-auto bg-zinc-800 rounded animate-pulse" />
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card hover className="text-center py-6 bg-zinc-900 border-zinc-800 group">
        <div 
          className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div className="text-3xl font-bold font-mono mb-1" style={{ color }}>
          {value}
        </div>
        <div className="text-sm text-zinc-500">{label}</div>
      </Card>
    </motion.div>
  )
}

export function StatsGrid() {
  const { data: statsData, isLoading, error } = useStats()

  if (error) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map((i) => (
          <Card key={i} className="flex flex-col items-center justify-center h-32 bg-zinc-900 border-zinc-800">
            <AlertCircle className="w-6 h-6 text-zinc-600 mb-2" />
            <span className="text-sm text-zinc-500">加载失败</span>
          </Card>
        ))}
      </div>
    )
  }

  const stats = statsData || { memories: 0, dreams: 0, avgHealth: 0, connections: 0 }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        label="记忆总数"
        value={stats.memories}
        icon={BookOpen}
        color="#22c55e"
        delay={0.1}
        isLoading={isLoading}
      />
      <StatCard
        label="Dream 次数"
        value={stats.dreams}
        icon={Cloud}
        color="#3b82f6"
        delay={0.2}
        isLoading={isLoading}
      />
      <StatCard
        label="平均健康度"
        value={`${stats.avgHealth}%`}
        icon={Zap}
        color="#eab308"
        delay={0.3}
        isLoading={isLoading}
      />
      <StatCard
        label="关联数"
        value={stats.connections || 0}
        icon={Link2}
        color="#f97316"
        delay={0.4}
        isLoading={isLoading}
      />
    </div>
  )
}

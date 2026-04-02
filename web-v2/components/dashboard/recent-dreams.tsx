'use client'

import { motion } from 'framer-motion'
import { Cloud, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { useDreams } from '@/lib/hooks'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'

function DreamRow({ dream, index }: { dream: any; index: number }) {
  const TrendIcon = dream.trend === 'up' ? ArrowUp : dream.trend === 'down' ? ArrowDown : Minus
  const trendColor = dream.trend === 'up' ? 'text-green-500' : dream.trend === 'down' ? 'text-red-500' : 'text-text-muted'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Cloud className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="font-medium">{dream.date}</div>
          <div className="text-sm text-text-muted">
            +{dream.newEntries} 记忆
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold text-lg">{dream.healthScore}</div>
        <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
          <TrendIcon className="w-4 h-4" />
          {dream.trendLabel || ''}
        </div>
      </div>
    </motion.div>
  )
}

export function RecentDreams() {
  const { data, isLoading } = useDreams(5)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>最近 Dreams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse h-16 bg-bg-elevated rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const dreams = data?.dreams || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>最近 Dreams</CardTitle>
      </CardHeader>
      <CardContent>
        {dreams.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            暂无 Dream 记录
          </div>
        ) : (
          <div>
            {dreams.map((dream, index) => (
              <DreamRow key={dream.id} dream={dream} index={index} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

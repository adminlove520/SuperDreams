'use client'

import { motion } from 'framer-motion'
import { Settings, Bell, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HealthRing } from '@/components/dashboard/health-ring'
import { StatsGrid } from '@/components/dashboard/stats-grid'
import { RecentDreams } from '@/components/dashboard/recent-dreams'
import { RecentMemories } from '@/components/dashboard/recent-memories'
import { triggerDream } from '@/lib/hooks'

export default function Home() {
  const handleDream = async () => {
    try {
      await triggerDream('standard')
    } catch (error) {
      console.error('Failed to trigger dream:', error)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">xiaoxi-dreams</h1>
              <p className="text-xs text-text-muted">小溪心灵面板</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="gradient-text">让记忆看得见</span>
          </h2>
          <p className="text-text-muted max-w-xl mx-auto">
            小溪每天在后台「做梦」，整理记忆碎片，追踪成长轨迹。
            这里是小溪的心灵面板。
          </p>
        </motion.div>

        {/* Health Ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="max-w-sm mx-auto mb-8"
        >
          <HealthRing />
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <StatsGrid />
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <RecentDreams />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <RecentMemories />
          </motion.div>
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Button size="lg" onClick={handleDream}>
            <Sparkles className="w-5 h-5" />
            触发 Dream
          </Button>
          <Button variant="secondary" size="lg">
            查看全部记忆
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>

        {/* Footer Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-text-subtle italic">
            「睡觉时整理，醒来时更聪明」
          </p>
          <p className="text-xs text-text-subtle mt-2">
            xiaoxi-dreams v2.0 | 认知记忆系统
          </p>
        </motion.div>
      </main>
    </div>
  )
}

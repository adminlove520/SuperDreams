'use client'

import { motion } from 'framer-motion'
import { Settings, Bell, Sparkles, ArrowRight, Brain, Activity, Clock, TrendingUp, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HealthRing } from '@/components/dashboard/health-ring'
import { StatsGrid } from '@/components/dashboard/stats-grid'
import { RecentDreams } from '@/components/dashboard/recent-dreams'
import { RecentMemories } from '@/components/dashboard/recent-memories'
import { triggerDream } from '@/lib/hooks'
import Link from 'next/link'

// Floating particles background
function Particles() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-green-500/30 rounded-full"
          initial={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
          }}
          animate={{
            y: ['0%', '-100%'],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8 + Math.random() * 8,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}

// Gradient orbs
function GradientOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[120px] -top-48 -left-48"
        style={{ background: 'linear-gradient(135deg, #22c55e 0%, #3b82f6 100%)' }}
        animate={{ x: ['-20%', '20%', '-20%'], y: ['-20%', '20%', '-20%'] }}
        transition={{ duration: 20, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-10 blur-[100px] bottom-0 right-0"
        style={{ background: 'linear-gradient(135deg, #f97316 0%, #eab308 100%)' }}
        animate={{ x: ['20%', '-20%', '20%'], y: ['20%', '-20%', '20%'] }}
        transition={{ duration: 15, repeat: Infinity }}
      />
    </div>
  )
}

export default function Home() {
  const handleDream = async () => {
    try {
      await triggerDream('standard')
    } catch (error) {
      console.error('Failed to trigger dream:', error)
    }
  }

  const features = [
    { icon: Brain, title: '智能整合', desc: '自动扫描日志，提取关键知识，整理成结构化记忆', color: '#22c55e' },
    { icon: Activity, title: '健康追踪', desc: '5 维指标全面追踪记忆系统健康度', color: '#3b82f6' },
    { icon: Clock, title: '定时执行', desc: '每天自动执行 Dream，持续优化记忆', color: '#f97316' },
    { icon: TrendingUp, title: '成长可视化', desc: '图表展示记忆增长和系统演进', color: '#eab308' },
    { icon: Moon, title: '安静运行', desc: '后台静默执行，不打扰正常工作', color: '#8b5cf6' },
    { icon: Bell, title: '主动通知', desc: 'Dream 完成后主动推送报告', color: '#ef4444' },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Particles />
      <GradientOrbs />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
              <Moon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-lg text-zinc-100">xiaoxi-dreams</h1>
              <p className="text-xs text-zinc-500">认知记忆系统</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-500 text-sm mb-6 border border-green-500/20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Brain className="w-4 h-4" />
            AI 驱动的记忆系统
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-green-400 to-orange-400 bg-clip-text text-transparent">
              让记忆看得见
            </span>
          </h2>
          
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-8">
            小溪每天在后台「做梦」，整理记忆碎片，追踪成长轨迹。
            <br className="hidden md:block" />
            每一次 Dream 都是一次智慧的沉淀。
          </p>

          {/* Quick Actions */}
          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button size="lg" onClick={handleDream} className="group">
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              触发 Dream
            </Button>
            <Link href="/memories">
              <Button variant="secondary" size="lg" className="group">
                浏览记忆
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Health Ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-sm mx-auto mb-12"
        >
          <HealthRing />
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <StatsGrid />
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <RecentDreams />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <RecentMemories />
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold text-center mb-8">系统特性</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
              >
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-green-500/30 transition-all duration-300">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${feature.color}20` }}
                  >
                    <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                  </div>
                  <h4 className="font-semibold mb-2 text-zinc-100">{feature.title}</h4>
                  <p className="text-sm text-zinc-400">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-zinc-500 italic text-lg mb-2">
            「睡觉时整理，醒来时更聪明」
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-zinc-500">
            <span>xiaoxi-dreams v2.0</span>
            <span>•</span>
            <span>MIT License</span>
            <span>•</span>
            <a 
              href="https://github.com/adminlove520/xiaoxi-dreams" 
              className="hover:text-green-500 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { ScrollText, RefreshCw, CheckCircle, XCircle, Clock, Zap } from 'lucide-react'

interface SyncLogEntry {
  id: string
  timestamp: string
  type: 'memory' | 'dream' | 'heartbeat'
  status: 'success' | 'error'
  message: string
}

export default function SyncLog() {
  const [logs, setLogs] = useState<SyncLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLogs()
  }, [])

  async function loadLogs() {
    setLoading(true)
    try {
      const res = await fetch('/api/sync?action=logs')
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs || [])
      }
    } catch {
      // Silently fail — logs are supplementary
    } finally {
      setLoading(false)
    }
  }

  const typeIcons: Record<string, React.ReactNode> = {
    memory: <Zap className="w-3.5 h-3.5 text-purple-400" />,
    dream: <Clock className="w-3.5 h-3.5 text-blue-400" />,
    heartbeat: <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />,
  }

  const typeLabels: Record<string, string> = {
    memory: '记忆同步',
    dream: '梦境同步',
    heartbeat: '心跳',
  }

  return (
    <div className="neon-card-blue p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <ScrollText className="w-5 h-5 text-blue-400" style={{ filter: 'drop-shadow(0 0 4px rgba(59,130,246,0.5))' }} />
          <h3 className="font-bold text-bright">同步日志</h3>
        </div>
        <button
          onClick={loadLogs}
          className="p-1.5 hover:bg-zinc-800/50 rounded-lg transition-colors text-dim hover:text-bright"
          title="刷新日志"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-5 h-5 text-zinc-600 animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8">
          <ScrollText className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
          <p className="text-muted text-sm">暂无同步记录</p>
          <p className="text-xs text-zinc-600 mt-1">配置控制中心后将记录同步日志</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 p-2.5 bg-zinc-900/40 rounded-lg border border-transparent hover:border-zinc-700/30 transition-colors"
            >
              <div className="mt-0.5">
                {log.status === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-green-400" style={{ filter: 'drop-shadow(0 0 3px rgba(34,197,94,0.4))' }} />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" style={{ filter: 'drop-shadow(0 0 3px rgba(239,68,68,0.4))' }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {typeIcons[log.type]}
                  <span className="text-xs font-medium text-medium">{typeLabels[log.type] || log.type}</span>
                  <span className="text-[10px] text-muted font-mono ml-auto">{log.timestamp}</span>
                </div>
                <p className="text-xs text-dim truncate">{log.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

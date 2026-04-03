'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, CheckCircle, AlertCircle, Zap } from 'lucide-react'

export default function SyncSettings() {
  const [centerUrl, setCenterUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUrl = localStorage.getItem('centerUrl')
      setCenterUrl(savedUrl || 'https://xiaoxi-dreams.vercel.app')
      setApiKey(localStorage.getItem('apiKey') || '')
    }
  }, [])

  async function handleSync() {
    if (!centerUrl || !apiKey) return
    
    setSyncing(true)
    setResult(null)
    
    localStorage.setItem('centerUrl', centerUrl)
    localStorage.setItem('apiKey', apiKey)

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ centerUrl, apiKey })
      })
      const json = await res.json()
      
      if (json.success) {
        setResult({ success: true, message: `已同步 ${json.memories.sent} 条记忆, ${json.dreams.sent} 条梦境` })
      } else {
        setResult({ success: false, message: json.error || '同步失败' })
      }
    } catch (e: any) {
      setResult({ success: false, message: e.message })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="neon-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <Zap className="w-5 h-5 text-green-400" style={{ filter: 'drop-shadow(0 0 4px rgba(34,197,94,0.5))' }} />
        <h3 className="font-bold text-bright">控制中心同步</h3>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-dim mb-1.5 font-mono">Center URL</label>
          <input 
            type="text" 
            value={centerUrl}
            onChange={(e) => setCenterUrl(e.target.value)}
            placeholder="https://xiaoxi-dreams.vercel.app"
            className="w-full bg-zinc-900/60 border border-zinc-700/40 rounded-lg px-3 py-2 text-sm text-medium font-mono focus:outline-none focus:border-green-500/60 focus:shadow-neon-green/20 transition-all placeholder:text-zinc-600"
          />
        </div>
        <div>
          <label className="block text-xs text-dim mb-1.5 font-mono">API Key</label>
          <input 
            type="password" 
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk_..."
            className="w-full bg-zinc-900/60 border border-zinc-700/40 rounded-lg px-3 py-2 text-sm text-medium font-mono focus:outline-none focus:border-green-500/60 focus:shadow-neon-green/20 transition-all placeholder:text-zinc-600"
          />
        </div>
        
        <button
          onClick={handleSync}
          disabled={syncing || !centerUrl || !apiKey}
          className="w-full neon-btn flex items-center justify-center gap-2 text-sm py-2.5"
        >
          {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {syncing ? '同步中...' : '立即同步'}
        </button>

        {result && (
          <div className={`flex items-center gap-2 text-xs mt-1 ${result.success ? 'neon-text-green' : 'text-red-400'}`}>
            {result.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {result.message}
          </div>
        )}
      </div>
    </div>
  )
}

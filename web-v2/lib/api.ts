// API Types - 与 server.js 保持一致
export interface Health {
  score: number
  status: 'healthy' | 'warning' | 'critical' | 'unknown'
  dimensions?: {
    freshness: number
    coverage: number
    coherence: number
    efficiency: number
    accessibility: number
  }
  trend?: 'up' | 'down' | 'stable'
  date?: string | null
  message?: string
}

export interface Memory {
  id: string
  type: 'fact' | 'decision' | 'lesson' | 'procedure' | 'person' | 'project'
  name: string
  summary: string
  importance: number
  tags: string[]
  createdAt: string
  updatedAt: string
  accessCount: number
}

export interface Dream {
  id: string
  date: string
  status: 'running' | 'completed' | 'failed'
  healthScore: number
  scannedFiles: number
  newEntries: number
  updatedEntries: number
  trend?: 'up' | 'down' | 'stable'
  trendLabel?: string
}

export interface Stats {
  memories: number
  dreams: number
  avgHealth: number
  connections?: number
}

// API 配置
// 开发环境: localhost:18792
// 生产环境: https://xiaoxi-dreams.vercel.app
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:18792'

// 错误状态
export interface ApiState {
  isLoading: boolean
  isError: boolean
  error: string | null
}

// API Client
async function fetchApi<T>(endpoint: string): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 
        'Content-Type': 'application/json',
        'X-API-Key': process.env.API_KEY || 'xiaoxi-api-key'
      },
      signal: AbortSignal.timeout(5000),
    })
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: { message: `HTTP ${res.status}` } }))
      return { data: null, error: errorData.error?.message || `HTTP ${res.status}` }
    }
    
    const data = await res.json()
    return { data, error: null }
  } catch (e: any) {
    if (e.name === 'AbortError' || e.name === 'TypeError') {
      return { data: null, error: '无法连接到 API 服务器' }
    }
    return { data: null, error: e.message || '未知错误' }
  }
}

// Health API
export const healthApi = {
  get: () => fetchApi<Health>('/health'),
  getHistory: (days = 7) => fetchApi<{ history: Health[] }>(`/health/history?days=${days}`),
}

// Memories API
export const memoriesApi = {
  list: (params?: { type?: string; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.type) searchParams.set('type', params.type)
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.offset) searchParams.set('offset', String(params.offset))
    const query = searchParams.toString()
    return fetchApi<{ memories: Memory[]; total: number }>(`/memories${query ? `?${query}` : ''}`)
  },
  get: (id: string) => fetchApi<Memory>(`/memories/${id}`),
}

// Dreams API
export const dreamsApi = {
  list: (limit = 10) => fetchApi<{ dreams: Dream[] }>(`/dreams?limit=${limit}`),
  trigger: (mode = 'standard') => fetchApi<{ status: string; message: string }>(`/dreams/trigger?mode=${mode}`),
}

// Stats API
export const statsApi = {
  get: () => fetchApi<Stats>('/stats'),
}

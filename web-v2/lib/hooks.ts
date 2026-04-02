import useSWR from 'swr'
import { healthApi, memoriesApi, dreamsApi, statsApi } from './api'

// Health hooks
export function useHealth() {
  return useSWR('health', async () => {
    const { data, error } = await healthApi.get()
    if (error) throw new Error(error)
    return data
  }, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
    shouldRetryOnError: false,
  })
}

export function useHealthHistory(days = 7) {
  return useSWR(['health-history', days], async () => {
    const { data, error } = await healthApi.getHistory(days)
    if (error) throw new Error(error)
    return data
  })
}

// Memories hooks
export function useMemories(params?: { type?: string; limit?: number; offset?: number }) {
  return useSWR(
    ['memories', JSON.stringify(params)],
    async () => {
      const { data, error } = await memoriesApi.list(params)
      if (error) throw new Error(error)
      return data
    },
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
      shouldRetryOnError: false,
    }
  )
}

export function useMemory(id: string) {
  return useSWR(id ? ['memory', id] : null, async () => {
    const { data, error } = await memoriesApi.get(id)
    if (error) throw new Error(error)
    return data
  })
}

// Dreams hooks
export function useDreams(limit = 10) {
  return useSWR(['dreams', limit], async () => {
    const { data, error } = await dreamsApi.list(limit)
    if (error) throw new Error(error)
    return data
  }, {
    refreshInterval: 60000,
    shouldRetryOnError: false,
  })
}

// Stats hooks
export function useStats() {
  return useSWR('stats', async () => {
    const { data, error } = await statsApi.get()
    if (error) throw new Error(error)
    return data
  }, {
    refreshInterval: 30000,
    shouldRetryOnError: false,
  })
}

// Action hooks
export async function triggerDream(mode = 'standard') {
  const { data, error } = await dreamsApi.trigger(mode)
  if (error) throw new Error(error)
  return data
}

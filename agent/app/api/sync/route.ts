import { NextRequest, NextResponse } from 'next/server'
import { memoryDb, dreamDb, syncLogDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/sync?action=logs — 获取同步日志
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'logs') {
      const logs = await syncLogDb.getAll(20)
      return NextResponse.json({ logs })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error: any) {
    console.error('Sync GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/sync — 同步本地数据到 Control Center
 *
 * Body: { centerUrl, apiKey }
 */
export async function POST(request: NextRequest) {
  try {
    const { centerUrl, apiKey } = await request.json()

    if (!centerUrl || !apiKey) {
      return NextResponse.json(
        { error: 'centerUrl and apiKey are required' },
        { status: 400 }
      )
    }

    const headers = { 
      'Authorization': `ApiKey ${apiKey}`, 
      'Content-Type': 'application/json' 
    }

    // 同步最近的记忆
    const { memories } = await memoryDb.getAll({ limit: 100 })
    const memoryPayload = memories.map(m => ({
      memoryUuid: m.id,
      digest: m.name,
      type: m.type,
      importance: m.importance,
      tags: m.tags,
      contentPreview: m.summary.substring(0, 200),
    }))

    let memStatus = 0
    try {
      const memRes = await fetch(`${centerUrl}/api/sync/memory`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ memories: memoryPayload }),
      })
      memStatus = memRes.status

      // Log success
      await syncLogDb.create({
        type: 'memory',
        status: 'success',
        message: `同步 ${memoryPayload.length} 条记忆到 ${centerUrl}`,
      })
    } catch (e: any) {
      await syncLogDb.create({
        type: 'memory',
        status: 'error',
        message: `记忆同步失败: ${e.message}`,
      })
    }

    // 同步最近的做梦记录
    const dreams = await dreamDb.getAll(10)
    const dreamPayload = dreams.filter(d => d.status === 'completed').map(d => ({
      dreamUuid: d.id,
      summary: d.report?.substring(0, 500) || '',
      healthScore: d.health_score,
      memoriesCreated: d.new_entries,
      status: d.status,
    }))

    let dreamStatus = 0
    try {
      const dreamRes = await fetch(`${centerUrl}/api/sync/dream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ dreams: dreamPayload }),
      })
      dreamStatus = dreamRes.status

      await syncLogDb.create({
        type: 'dream',
        status: 'success',
        message: `同步 ${dreamPayload.length} 条梦境到 ${centerUrl}`,
      })
    } catch (e: any) {
      await syncLogDb.create({
        type: 'dream',
        status: 'error',
        message: `梦境同步失败: ${e.message}`,
      })
    }

    return NextResponse.json({
      success: true,
      status: 'synced',
      memories: { sent: memoryPayload.length, status: memStatus },
      dreams: { sent: dreamPayload.length, status: dreamStatus },
    })
  } catch (error: any) {
    console.error('Sync error:', error)
    await syncLogDb.create({
      type: 'memory',
      status: 'error',
      message: `同步失败: ${error.message}`,
    }).catch(() => {})
    return NextResponse.json(
      { error: 'Sync failed', details: error.message },
      { status: 500 }
    )
  }
}

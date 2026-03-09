import { supabase, TABLES } from '../../lib/supabase'

/**
 * 导出宫殿数据为 JSON
 * 
 * GET /api/export?userId=xxx&palaceId=xxx
 * 或 GET /api/export?userId=xxx (导出全部)
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' })
  }

  const { userId, palaceId } = req.query

  if (!userId) {
    return res.status(400).json({ error: '需要用户 ID' })
  }

  try {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      userId,
      palaces: []
    }

    // 获取宫殿
    let palacesQuery = supabase
      .from(TABLES.PALACES)
      .select(`
        *,
        rooms:rooms(
          *,
          memories:memories(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // 如果指定了宫殿 ID，只导出该宫殿
    if (palaceId) {
      palacesQuery = palacesQuery.eq('id', palaceId)
    }

    const { data: palaces, error } = await palacesQuery

    if (error) {
      console.error('导出数据失败:', error)
      return res.status(500).json({ error: '导出失败' })
    }

    exportData.palaces = palaces || []
    exportData.count = {
      palaces: palaces.length,
      rooms: palaces.reduce((sum, p) => sum + (p.rooms?.length || 0), 0),
      memories: palaces.reduce((sum, p) => 
        sum + p.rooms?.reduce((s, r) => s + (r.memories?.length || 0), 0) || 0, 0
      )
    }

    // 设置响应头为文件下载
    res.setHeader('Content-Type', 'application/json')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="memory-palace-export-${Date.now()}.json"`
    )

    return res.status(200).json(exportData)
  } catch (error) {
    console.error('导出异常:', error)
    return res.status(500).json({ error: '导出异常' })
  }
}

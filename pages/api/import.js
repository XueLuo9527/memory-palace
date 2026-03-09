import { supabase, TABLES } from '../../lib/supabase'

/**
 * 导入宫殿数据
 * 
 * POST /api/import
 * Body: { userId, data: { palaces: [...] } }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' })
  }

  const { userId, data, merge = false } = req.body

  if (!userId) {
    return res.status(400).json({ error: '需要用户 ID' })
  }

  if (!data || !data.palaces) {
    return res.status(400).json({ error: '无效的导入数据' })
  }

  try {
    const result = {
      palaces: 0,
      rooms: 0,
      memories: 0,
      errors: []
    }

    // 如果 merge=false，先删除用户现有数据
    if (!merge) {
      // 删除所有记忆
      await supabase
        .from(TABLES.MEMORIES)
        .delete()
        .in('room_id', 
          supabase
            .from(TABLES.ROOMS)
            .select('id')
            .in('palace_id',
              supabase
                .from(TABLES.PALACES)
                .select('id')
                .eq('user_id', userId)
            )
        )

      // 删除所有房间
      await supabase
        .from(TABLES.ROOMS)
        .delete()
        .in('palace_id',
          supabase
            .from(TABLES.PALACES)
            .select('id')
            .eq('user_id', userId)
        )

      // 删除所有宫殿
      await supabase
        .from(TABLES.PALACES)
        .delete()
        .eq('user_id', userId)
    }

    // 导入宫殿
    for (const palace of data.palaces) {
      try {
        // 创建宫殿（不包含原 ID，让数据库生成新 ID）
        const { data: newPalace, error: palaceError } = await supabase
          .from(TABLES.PALACES)
          .insert({
            user_id: userId,
            name: palace.name,
            description: palace.description || '',
            created_at: palace.created_at || new Date().toISOString(),
            updated_at: palace.updated_at || new Date().toISOString()
          })
          .select()
          .single()

        if (palaceError) {
          result.errors.push(`宫殿 "${palace.name}" 导入失败：${palaceError.message}`)
          continue
        }

        result.palaces++

        // 导入房间
        if (palace.rooms) {
          for (const room of palace.rooms) {
            try {
              const { data: newRoom, error: roomError } = await supabase
                .from(TABLES.ROOMS)
                .insert({
                  palace_id: newPalace.id,
                  name: room.name,
                  description: room.description || '',
                  created_at: room.created_at || new Date().toISOString(),
                  updated_at: room.updated_at || new Date().toISOString()
                })
                .select()
                .single()

              if (roomError) {
                result.errors.push(`房间 "${room.name}" 导入失败：${roomError.message}`)
                continue
              }

              result.rooms++

              // 导入记忆
              if (room.memories) {
                for (const memory of room.memories) {
                  try {
                    const { data: newMemory, error: memoryError } = await supabase
                      .from(TABLES.MEMORIES)
                      .insert({
                        room_id: newRoom.id,
                        title: memory.title,
                        content: memory.content || '',
                        tags: memory.tags || [],
                        created_at: memory.created_at || new Date().toISOString(),
                        updated_at: memory.updated_at || new Date().toISOString()
                      })
                      .select()
                      .single()

                    if (memoryError) {
                      result.errors.push(`记忆 "${memory.title}" 导入失败：${memoryError.message}`)
                      continue
                    }

                    result.memories++
                  } catch (err) {
                    result.errors.push(`记忆 "${memory.title}" 导入异常：${err.message}`)
                  }
                }
              }
            } catch (err) {
              result.errors.push(`房间 "${room.name}" 导入异常：${err.message}`)
            }
          }
        }
      } catch (err) {
        result.errors.push(`宫殿 "${palace.name}" 导入异常：${err.message}`)
      }
    }

    return res.status(200).json({
      success: true,
      result,
      message: `导入完成：${result.palaces} 个宫殿，${result.rooms} 个房间，${result.memories} 个记忆`
    })
  } catch (error) {
    console.error('导入异常:', error)
    return res.status(500).json({ 
      success: false, 
      error: '导入异常',
      message: error.message 
    })
  }
}

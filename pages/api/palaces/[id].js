import { 
  getPalaceById,
  updatePalace,
  deletePalace,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomById,
  createMemory,
  updateMemory,
  deleteMemory,
  searchMemories,
  getMemoriesByTag,
  getAllTags,
  addTagsToMemory,
  removeTagFromMemory
} from '@/lib/db-local'

export default async function handler(req, res) {
  const { id } = req.query
  const userId = req.query.userId || req.body.userId
  
  if (!userId) {
    return res.status(400).json({ error: '需要用户 ID' })
  }
  
  if (req.method === 'GET') {
    const { search, roomId, tag, getTags } = req.query
    
    if (getTags === 'true') {
      // 获取宫殿所有标签
      const tags = await getAllTags(id)
      return res.status(200).json(tags)
    }
    
    if (tag) {
      // 按标签筛选记忆
      const results = await getMemoriesByTag(id, tag)
      return res.status(200).json(results)
    }
    
    if (search) {
      // 搜索记忆
      const results = await searchMemories(id, search)
      return res.status(200).json(results)
    }
    
    if (roomId) {
      // 获取特定房间详情
      const room = await getRoomById(roomId, userId)
      if (!room) {
        return res.status(404).json({ error: '房间不存在' })
      }
      return res.status(200).json(room)
    }
    
    // 获取宫殿详情
    const palace = await getPalaceById(id, userId)
    if (!palace) {
      return res.status(404).json({ error: '宫殿不存在' })
    }
    return res.status(200).json(palace)
  }
  
  if (req.method === 'POST') {
    const { roomId, title, content, name, description, tags } = req.body
    
    if (roomId) {
      // 在房间中创建记忆
      if (!title) {
        return res.status(400).json({ error: '记忆标题不能为空' })
      }
      const memory = await createMemory(roomId, title, content || '', tags || [])
      if (!memory) {
        return res.status(500).json({ error: '创建记忆失败' })
      }
      return res.status(201).json(memory)
    } else {
      // 在宫殿中创建房间
      if (!name) {
        return res.status(400).json({ error: '房间名称不能为空' })
      }
      const room = await createRoom(id, name, description || '')
      if (!room) {
        return res.status(500).json({ error: '创建房间失败' })
      }
      return res.status(201).json(room)
    }
  }
  
  if (req.method === 'PUT') {
    const { roomId, memoryId, title, content, tags, addTag, removeTag } = req.body
    
    if (memoryId && roomId) {
      if (addTag) {
        // 添加标签
        const memory = await addTagsToMemory(memoryId, [addTag])
        if (!memory) {
          return res.status(500).json({ error: '添加标签失败' })
        }
        return res.status(200).json(memory)
      }
      
      if (removeTag) {
        // 移除标签
        const memory = await removeTagFromMemory(memoryId, removeTag)
        if (!memory) {
          return res.status(500).json({ error: '移除标签失败' })
        }
        return res.status(200).json(memory)
      }
      
      // 更新记忆（包括标签）
      const memory = await updateMemory(memoryId, { 
        title, 
        content,
        tags: tags || undefined
      })
      if (!memory) {
        return res.status(500).json({ error: '更新记忆失败' })
      }
      return res.status(200).json(memory)
    } else if (roomId) {
      // 更新房间
      const room = await updateRoom(roomId, { name: req.body.name, description: req.body.description })
      if (!room) {
        return res.status(500).json({ error: '更新房间失败' })
      }
      return res.status(200).json(room)
    }
    
    return res.status(400).json({ error: '需要提供房间 ID 或记忆 ID' })
  }
  
  if (req.method === 'DELETE') {
    const { roomId, memoryId } = req.body
    
    if (memoryId && roomId) {
      // 删除记忆
      const success = await deleteMemory(memoryId)
      if (!success) {
        return res.status(500).json({ error: '删除记忆失败' })
      }
      return res.status(200).json({ success: true })
    } else if (roomId) {
      // 删除房间
      const success = await deleteRoom(roomId)
      if (!success) {
        return res.status(500).json({ error: '删除房间失败' })
      }
      return res.status(200).json({ success: true })
    } else if (req.body.id) {
      // 删除宫殿
      const success = await deletePalace(req.body.id, userId)
      if (!success) {
        return res.status(500).json({ error: '删除宫殿失败' })
      }
      return res.status(200).json({ success: true })
    }
    
    return res.status(400).json({ error: '需要提供 ID' })
  }
  
  return res.status(405).json({ error: '方法不允许' })
}

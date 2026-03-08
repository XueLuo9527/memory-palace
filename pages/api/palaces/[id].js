import { 
  getPalaceById, 
  createRoom, 
  deleteRoom,
  createMemory,
  updateMemory,
  deleteMemory,
  searchMemories
} from '../../../data/palaces'

export default function handler(req, res) {
  const { id } = req.query
  const palaceId = parseInt(id)
  
  if (req.method === 'GET') {
    // 获取单个宫殿详情，或搜索记忆
    const { search, roomId } = req.query
    
    if (search) {
      // 搜索记忆
      const results = searchMemories(palaceId, search)
      return res.status(200).json(results)
    }
    
    const palace = getPalaceById(palaceId)
    if (!palace) {
      return res.status(404).json({ error: '宫殿不存在' })
    }
    
    if (roomId) {
      // 获取特定房间详情
      const room = palace.rooms.find(r => r.id === parseInt(roomId))
      if (!room) {
        return res.status(404).json({ error: '房间不存在' })
      }
      return res.status(200).json(room)
    }
    
    return res.status(200).json(palace)
  }
  
  if (req.method === 'POST') {
    const { roomId, title, content, name, description } = req.body
    
    if (roomId) {
      // 在房间中创建记忆
      if (!title) {
        return res.status(400).json({ error: '记忆标题不能为空' })
      }
      const memory = createMemory(palaceId, roomId, title, content || '')
      if (!memory) {
        return res.status(404).json({ error: '宫殿或房间不存在' })
      }
      return res.status(201).json(memory)
    } else {
      // 在宫殿中创建房间
      if (!name) {
        return res.status(400).json({ error: '房间名称不能为空' })
      }
      const room = createRoom(palaceId, name, description || '')
      if (!room) {
        return res.status(404).json({ error: '宫殿不存在' })
      }
      return res.status(201).json(room)
    }
  }
  
  if (req.method === 'PUT') {
    // 更新记忆
    const { roomId, memoryId, title, content } = req.body
    if (!roomId || !memoryId) {
      return res.status(400).json({ error: '需要提供房间 ID 和记忆 ID' })
    }
    const memory = updateMemory(palaceId, roomId, memoryId, title, content)
    if (!memory) {
      return res.status(404).json({ error: '宫殿、房间或记忆不存在' })
    }
    return res.status(200).json(memory)
  }
  
  if (req.method === 'DELETE') {
    const { roomId, memoryId } = req.body
    
    if (memoryId && roomId) {
      // 删除记忆
      const success = deleteMemory(palaceId, roomId, memoryId)
      if (!success) {
        return res.status(404).json({ error: '宫殿、房间或记忆不存在' })
      }
      return res.status(200).json({ success: true })
    } else if (roomId) {
      // 删除房间
      const success = deleteRoom(palaceId, roomId)
      if (!success) {
        return res.status(404).json({ error: '宫殿或房间不存在' })
      }
      return res.status(200).json({ success: true })
    }
    
    return res.status(400).json({ error: '需要提供房间 ID 或记忆 ID' })
  }
  
  return res.status(405).json({ error: '方法不允许' })
}

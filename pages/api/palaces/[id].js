import { getPalaceById, createRoom, deleteRoom } from '../../../data/palaces'

export default function handler(req, res) {
  const { id } = req.query
  const palaceId = parseInt(id)
  
  if (req.method === 'GET') {
    // 获取单个宫殿详情
    const palace = getPalaceById(palaceId)
    if (!palace) {
      return res.status(404).json({ error: '宫殿不存在' })
    }
    return res.status(200).json(palace)
  }
  
  if (req.method === 'POST') {
    // 在宫殿中创建房间
    const { name, description } = req.body
    if (!name) {
      return res.status(400).json({ error: '房间名称不能为空' })
    }
    const room = createRoom(palaceId, name, description || '')
    if (!room) {
      return res.status(404).json({ error: '宫殿不存在' })
    }
    return res.status(201).json(room)
  }
  
  if (req.method === 'DELETE') {
    // 删除房间
    const { roomId } = req.body
    if (!roomId) {
      return res.status(400).json({ error: '需要提供房间 ID' })
    }
    const success = deleteRoom(palaceId, roomId)
    if (!success) {
      return res.status(404).json({ error: '宫殿或房间不存在' })
    }
    return res.status(200).json({ success: true })
  }
  
  return res.status(405).json({ error: '方法不允许' })
}

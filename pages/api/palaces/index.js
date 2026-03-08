import { getPalaces, createPalace, deletePalace } from '../../lib/db'

export default async function handler(req, res) {
  // 获取用户 ID（暂时从 query 参数获取，后续接入认证）
  const userId = req.query.userId || req.body.userId
  
  if (!userId) {
    return res.status(400).json({ error: '需要用户 ID' })
  }
  
  if (req.method === 'GET') {
    // 获取所有宫殿
    const palaces = await getPalaces(userId)
    return res.status(200).json(palaces)
  }
  
  if (req.method === 'POST') {
    // 创建新宫殿
    const { name, description } = req.body
    if (!name) {
      return res.status(400).json({ error: '宫殿名称不能为空' })
    }
    
    const palace = await createPalace(userId, name, description || '')
    if (!palace) {
      return res.status(500).json({ error: '创建宫殿失败' })
    }
    
    return res.status(201).json(palace)
  }
  
  if (req.method === 'DELETE') {
    // 删除宫殿
    const { id } = req.body
    if (!id) {
      return res.status(400).json({ error: '需要提供宫殿 ID' })
    }
    
    const success = await deletePalace(id, userId)
    if (!success) {
      return res.status(500).json({ error: '删除宫殿失败' })
    }
    
    return res.status(200).json({ success: true })
  }
  
  return res.status(405).json({ error: '方法不允许' })
}

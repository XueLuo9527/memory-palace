import { getPalaces, createPalace, deletePalace } from '../../data/palaces'

export default function handler(req, res) {
  if (req.method === 'GET') {
    // 获取所有宫殿
    const palaces = getPalaces()
    return res.status(200).json(palaces)
  }
  
  if (req.method === 'POST') {
    // 创建新宫殿
    const { name, description } = req.body
    if (!name) {
      return res.status(400).json({ error: '宫殿名称不能为空' })
    }
    const palace = createPalace(name, description || '')
    return res.status(201).json(palace)
  }
  
  if (req.method === 'DELETE') {
    // 删除宫殿
    const { id } = req.body
    if (!id) {
      return res.status(400).json({ error: '需要提供宫殿 ID' })
    }
    deletePalace(id)
    return res.status(200).json({ success: true })
  }
  
  return res.status(405).json({ error: '方法不允许' })
}

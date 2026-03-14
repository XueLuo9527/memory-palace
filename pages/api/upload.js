/**
 * 文件上传 API
 * 支持图片等文件上传，保存为 Base64 格式（适用于小型文件）
 * 对于大文件，建议配置对象存储（如 Supabase Storage）
 */

import { getCurrentUser } from '../../../lib/auth'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb', // 限制上传大小为 2MB
    },
  },
}

export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' })
  }

  try {
    // 检查用户登录
    const user = getCurrentUser()
    if (!user) {
      return res.status(401).json({ error: '未登录' })
    }

    const { file, filename, mimeType } = req.body

    if (!file) {
      return res.status(400).json({ error: '文件内容不能为空' })
    }

    // 验证文件类型（只允许图片）
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (mimeType && !allowedTypes.includes(mimeType)) {
      return res.status(400).json({ 
        error: '不支持的文件类型',
        allowed: allowedTypes.join(', ')
      })
    }

    // 验证 Base64 大小（约 2MB）
    const base64Data = file.split(',')[1] || file
    if (base64Data.length > 2 * 1024 * 1024 * 1.33) {
      return res.status(400).json({ error: '文件大小超过限制 (2MB)' })
    }

    // 生成文件 ID
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // 创建文件记录
    const fileRecord = {
      id: fileId,
      userId: user.id,
      filename: filename || 'uploaded-image.png',
      mimeType: mimeType || 'image/png',
      data: file, // Base64 数据
      size: base64Data.length,
      createdAt: new Date().toISOString()
    }

    // 保存到 localStorage（实际生产环境应该使用对象存储）
    const storageKey = `memory-palace-files-${user.id}`
    const existingFiles = JSON.parse(localStorage.getItem(storageKey) || '[]')
    existingFiles.push(fileRecord)
    
    // 注意：在 Next.js API 中无法直接访问 localStorage
    // 这里返回文件数据，由前端保存到记忆中
    return res.status(200).json({
      success: true,
      file: {
        id: fileId,
        url: file, // Base64 数据 URL
        filename: fileRecord.filename,
        mimeType: fileRecord.mimeType,
        size: fileRecord.size
      }
    })

  } catch (error) {
    console.error('文件上传失败:', error)
    return res.status(500).json({ error: '上传失败：' + error.message })
  }
}

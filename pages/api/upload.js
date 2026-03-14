/**
 * 文件上传 API
 * 支持图片等文件上传，保存为 Base64 格式（适用于小型文件）
 * 对于大文件，建议配置对象存储（如 Supabase Storage）
 */

// 注意：API 路由中无法使用 localStorage，由前端直接保存 Base64 数据到记忆中

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
    
    // 返回文件数据，由前端保存到记忆中
    return res.status(200).json({
      success: true,
      file: {
        id: fileId,
        url: file, // Base64 数据 URL
        filename: filename || 'uploaded-image.png',
        mimeType: mimeType || 'image/png',
        size: base64Data.length
      }
    })

  } catch (error) {
    console.error('文件上传失败:', error)
    return res.status(500).json({ error: '上传失败：' + error.message })
  }
}

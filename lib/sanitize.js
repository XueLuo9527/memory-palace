/**
 * XSS 防护模块
 * 
 * 使用 DOMPurify 对用户输入内容进行净化，防止 XSS 攻击
 */

import DOMPurify from 'isomorphic-dompurify'

/**
 * 允许的 HTML 标签白名单
 */
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u',
  'code', 'pre', 'blockquote', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
]

/**
 * 允许的 HTML 属性白名单
 */
const ALLOWED_ATTR = []

/**
 * 净化 HTML 内容
 * @param {string} html - 原始 HTML 内容
 * @returns {string} 净化后的 HTML
 */
export function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') {
    return ''
  }
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR
  })
}

/**
 * 净化纯文本（移除所有 HTML 标签）
 * @param {string} text - 原始文本
 * @returns {string} 净化后的纯文本
 */
export function sanitizeText(text) {
  if (!text || typeof text !== 'string') {
    return ''
  }
  
  // 移除所有 HTML 标签
  return text.replace(/<[^>]*>/g, '').trim()
}

/**
 * 净化记忆内容（允许有限的格式化）
 * @param {string} content - 记忆内容
 * @returns {string} 净化后的内容
 */
export function sanitizeMemoryContent(content) {
  return sanitizeHtml(content)
}

/**
 * 净化标签
 * @param {string|string[]} tags - 标签数组或逗号分隔的字符串
 * @returns {string[]} 净化后的标签数组
 */
export function sanitizeTags(tags) {
  if (!tags) {
    return []
  }
  
  // 如果是字符串，按逗号分割
  if (typeof tags === 'string') {
    tags = tags.split(',').map(tag => tag.trim())
  }
  
  // 过滤空标签和过长的标签
  return tags
    .filter(tag => tag && tag.length > 0 && tag.length <= 50)
    .map(tag => sanitizeText(tag))
    .slice(0, 10) // 最多 10 个标签
}

/**
 * 转义 HTML 特殊字符（用于纯文本显示）
 * @param {string} text - 原始文本
 * @returns {string} 转义后的文本
 */
export function escapeHtml(text) {
  if (!text || typeof text !== 'string') {
    return ''
  }
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  
  return text.replace(/[&<>"']/g, m => map[m])
}

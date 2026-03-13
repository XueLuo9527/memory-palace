/**
 * 用户认证模块
 * 
 * 兼容两种认证方式：
 * - localStorage 临时方案（默认，无需配置）
 * - Supabase Auth（可选，需要配置环境变量）
 */

import { supabase, isSupabaseEnabled } from './supabase'

// 检查是否启用了 Supabase
const hasSupabase = isSupabaseEnabled()

// 当前登录用户缓存
let currentUser = null

/**
 * 初始化用户（从 localStorage 加载 - 向后兼容）
 * @returns {User|null}
 */
export function initUser() {
  if (currentUser) return currentUser
  
  const saved = localStorage.getItem('memory-palace-user')
  if (saved) {
    try {
      currentUser = JSON.parse(saved)
      return currentUser
    } catch {
      return null
    }
  }
  return null
}

/**
 * 创建/登录用户（临时方案 - 向后兼容）
 * @param {string} name 
 * @returns {User}
 */
export function login(name) {
  const user = {
    id: 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
    name: name.trim(),
    createdAt: new Date().toISOString()
  }
  
  currentUser = user
  localStorage.setItem('memory-palace-user', JSON.stringify(user))
  return user
}

/**
 * 获取当前用户
 * @returns {User|null}
 */
export function getCurrentUser() {
  if (!currentUser) {
    return initUser()
  }
  return currentUser
}

/**
 * 退出登录
 */
export function logout() {
  currentUser = null
  localStorage.removeItem('memory-palace-user')
  localStorage.removeItem('memory-palace-session')
}

/**
 * 更新用户信息
 * @param {Partial<User>} updates 
 * @returns {User|null}
 */
export function updateUser(updates) {
  const user = getCurrentUser()
  if (!user) return null
  
  Object.assign(user, updates)
  currentUser = user
  localStorage.setItem('memory-palace-user', JSON.stringify(user))
  return user
}

/**
 * 生成临时用户 ID（用于 API 调用）
 * @returns {string|null}
 */
export function getUserId() {
  const user = getCurrentUser()
  return user?.id || null
}

/**
 * ========== Supabase Auth 新方法（可选） ==========
 */

/**
 * 从 Supabase Auth 获取当前用户
 * @returns {Promise<User|null>}
 */
export async function getCurrentUserFromSupabase() {
  if (!hasSupabase) {
    return null
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null
    
    return {
      id: user.id,
      name: user.user_metadata?.name || '用户',
      email: user.email,
      avatar: user.user_metadata?.avatar_url
    }
  } catch (error) {
    console.error('Get user error:', error)
    return null
  }
}

/**
 * 监听认证状态变化
 * @param {Function} callback 
 * @returns {Function} 取消监听函数
 */
export function onAuthStateChange(callback) {
  if (!hasSupabase) {
    return () => {}
  }
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
  
  return () => {
    subscription.unsubscribe()
  }
}

/**
 * 检查是否已认证
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  if (!hasSupabase) {
    return !!getCurrentUser()
  }
  
  const user = await getCurrentUserFromSupabase()
  return !!user
}

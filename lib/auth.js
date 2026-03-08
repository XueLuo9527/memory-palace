/**
 * 简单用户认证模块（临时方案 - 基于 localStorage）
 * 
 * 注意：这是开发阶段的临时方案，生产环境请接入 Supabase Auth
 */

// 用户数据结构
export interface User {
  id: string
  name: string
  avatar?: string
  createdAt: string
}

// 当前登录用户
let currentUser: User | null = null

/**
 * 初始化用户（从 localStorage 加载）
 */
export function initUser(): User | null {
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
 * 创建/登录用户
 */
export function login(name: string): User {
  const user: User = {
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
 */
export function getCurrentUser(): User | null {
  if (!currentUser) {
    return initUser()
  }
  return currentUser
}

/**
 * 退出登录
 */
export function logout(): void {
  currentUser = null
  localStorage.removeItem('memory-palace-user')
}

/**
 * 更新用户信息
 */
export function updateUser(updates: Partial<User>): User | null {
  const user = getCurrentUser()
  if (!user) return null
  
  Object.assign(user, updates)
  currentUser = user
  localStorage.setItem('memory-palace-user', JSON.stringify(user))
  return user
}

/**
 * 生成临时用户 ID（用于 API 调用）
 */
export function getUserId(): string | null {
  const user = getCurrentUser()
  return user?.id || null
}

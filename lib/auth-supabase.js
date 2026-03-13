/**
 * Supabase Auth 认证模块
 * 
 * 提供用户注册、登录、登出、会话管理等功能
 */

import { supabase } from './supabase'

/**
 * 用户注册
 * @param {string} email - 邮箱
 * @param {string} password - 密码
 * @param {string} name - 用户名
 * @returns {Promise<{data: any, error: any}>}
 */
export async function signUp(email, password, name) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name.trim()
        }
      }
    })
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Sign up error:', error)
    return { data: null, error }
  }
}

/**
 * 用户登录
 * @param {string} email - 邮箱
 * @param {string} password - 密码
 * @returns {Promise<{data: any, error: any}>}
 */
export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Sign in error:', error)
    return { data: null, error }
  }
}

/**
 * 用户登出
 * @returns {Promise<{error: any}>}
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Sign out error:', error)
    return { error }
  }
}

/**
 * 获取当前用户
 * @returns {Promise<{user: any, error: any}>}
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return { user, error: null }
  } catch (error) {
    // 未登录不算错误
    return { user: null, error: null }
  }
}

/**
 * 监听认证状态变化
 * @param {Function} callback - 回调函数 (event, session) => void
 * @returns {Function} 取消监听函数
 */
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
  
  return () => {
    subscription.unsubscribe()
  }
}

/**
 * 验证用户是否已登录
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  const { user } = await getCurrentUser()
  return !!user
}

/**
 * 获取用户会话
 * @returns {Promise<{session: any, error: any}>}
 */
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return { session, error: null }
  } catch (error) {
    return { session: null, error }
  }
}

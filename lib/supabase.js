import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Supabase 客户端（可选配置）
// 如果没有配置环境变量，导出 null，应用将使用本地存储模式
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// 数据库表名
export const TABLES = {
  PALACES: 'palaces',
  ROOMS: 'rooms',
  MEMORIES: 'memories',
}

/**
 * 检查是否启用了 Supabase
 */
export function isSupabaseEnabled() {
  return !!supabase
}

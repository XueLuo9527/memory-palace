import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase 配置缺失，请检查 .env.local 文件')
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
)

// 数据库表名
export const TABLES = {
  PALACES: 'palaces',
  ROOMS: 'rooms',
  MEMORIES: 'memories',
}

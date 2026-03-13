/**
 * 用户登出 API
 * 
 * POST /api/auth/logout
 */

import { supabase } from '../../../lib/supabase'
import { handleErrors, createSuccess, createError } from '../../../lib/api-handler'

export default handleErrors(async (req, res) => {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json(createError('方法不允许', { allowed: ['POST'] }, 405))
  }
  
  // 登出
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Logout error:', error)
    return res.status(500).json(createError('登出失败', error.message, 500))
  }
  
  return res.status(200).json(createSuccess(null, '登出成功'))
})

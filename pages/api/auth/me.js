/**
 * 获取当前用户信息 API
 * 
 * GET /api/auth/me
 */

import { supabase } from '../../../lib/supabase'
import { handleErrors, createSuccess, createError } from '../../../lib/api-handler'

export default handleErrors(async (req, res) => {
  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json(createError('方法不允许', { allowed: ['GET'] }, 405))
  }
  
  // 获取当前用户
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return res.status(401).json(createError('未登录', null, 401))
  }
  
  return res.status(200).json(createSuccess(
    {
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || '用户',
        avatar: user.user_metadata?.avatar_url
      }
    },
    '获取成功'
  ))
})

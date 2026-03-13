/**
 * 刷新会话 API
 * 
 * POST /api/auth/refresh
 */

import { supabase } from '../../../lib/supabase'
import { handleErrors, createSuccess, createError } from '../../../lib/api-handler'

export default handleErrors(async (req, res) => {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json(createError('方法不允许', { allowed: ['POST'] }, 405))
  }
  
  const { refreshToken } = req.body
  
  if (!refreshToken) {
    return res.status(400).json(createError('缺少刷新令牌', null, 400))
  }
  
  // 刷新会话
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken
  })
  
  if (error || !data.session) {
    console.error('Refresh error:', error)
    return res.status(401).json(createError('刷新失败，请重新登录', null, 401))
  }
  
  return res.status(200).json(createSuccess(
    {
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at
      }
    },
    '刷新成功'
  ))
})

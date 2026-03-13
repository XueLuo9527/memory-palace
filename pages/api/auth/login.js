/**
 * 用户登录 API
 * 
 * POST /api/auth/login
 */

import { supabase } from '../../../lib/supabase'
import { handleErrors, createSuccess, createError } from '../../../lib/api-handler'
import { validateLogin } from '../../../lib/validators'

export default handleErrors(async (req, res) => {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json(createError('方法不允许', { allowed: ['POST'] }, 405))
  }
  
  // 验证输入
  const validation = validateLogin(req.body)
  if (!validation.success) {
    return res.status(400).json(createError(validation.error.message, validation.error.details, 400))
  }
  
  const { email, password } = validation.data
  
  // 登录
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (authError) {
    console.error('Login error:', authError)
    return res.status(401).json(createError('邮箱或密码错误', null, 401))
  }
  
  // 返回用户信息和会话
  return res.status(200).json(createSuccess(
    {
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata?.name || '用户'
      },
      session: {
        accessToken: authData.session?.access_token,
        refreshToken: authData.session?.refresh_token,
        expiresAt: authData.session?.expires_at
      }
    },
    '登录成功'
  ))
})

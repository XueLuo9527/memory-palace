/**
 * 用户注册 API
 * 
 * POST /api/auth/signup
 */

import { supabase } from '../../../lib/supabase'
import { handleErrors, createSuccess, createError } from '../../../lib/api-handler'
import { validateSignup } from '../../../lib/validators'

export default handleErrors(async (req, res) => {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json(createError('方法不允许', { allowed: ['POST'] }, 405))
  }
  
  // 验证输入
  const validation = validateSignup(req.body)
  if (!validation.success) {
    return res.status(400).json(createError(validation.error.message, validation.error.details, 400))
  }
  
  const { name, email, password } = validation.data
  
  // 检查邮箱是否已存在
  const { data: existingUsers } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()
  
  if (existingUsers) {
    return res.status(409).json(createError('该邮箱已被注册', null, 409))
  }
  
  // 创建 Supabase Auth 用户
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name
      }
    }
  })
  
  if (authError) {
    console.error('Auth error:', authError)
    return res.status(400).json(createError(authError.message, null, 400))
  }
  
  // 返回用户信息（不包含密码）
  return res.status(201).json(createSuccess(
    {
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata?.name || name
      }
    },
    '注册成功'
  ))
})

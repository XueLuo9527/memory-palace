/**
 * API 错误处理中间件
 * 
 * 统一处理 API 错误，返回标准化的错误响应
 */

/**
 * 标准化错误响应格式
 * @param {string} message - 错误消息
 * @param {any} details - 详细错误信息
 * @param {number} statusCode - HTTP 状态码
 * @returns {object} 标准化错误对象
 */
export function createError(message, details = null, statusCode = 500) {
  return {
    error: {
      message,
      details,
      statusCode,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * 标准化成功响应格式
 * @param {any} data - 响应数据
 * @param {string} message - 成功消息
 * @returns {object} 标准化成功对象
 */
export function createSuccess(data, message = '操作成功') {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  }
}

/**
 * API 错误处理包装器
 * @param {Function} fn - API 处理函数
 * @returns {Function} 包装后的函数
 */
export function handleErrors(fn) {
  return async (req, res) => {
    try {
      return await fn(req, res)
    } catch (error) {
      console.error('API Error:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method
      })
      
      // 处理 Zod 验证错误
      if (error.name === 'ZodError') {
        const details = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
        return res.status(400).json(createError('验证失败', details, 400))
      }
      
      // 处理 Supabase 错误
      if (error.status && error.message) {
        return res.status(error.status).json(createError(error.message, null, error.status))
      }
      
      // 默认错误处理
      const statusCode = error.statusCode || 500
      const message = error.message || '服务器内部错误'
      return res.status(statusCode).json(createError(message, null, statusCode))
    }
  }
}

/**
 * 验证请求方法
 * @param {string[]} allowedMethods - 允许的 HTTP 方法
 * @returns {Function} 中间件函数
 */
export function checkMethods(...allowedMethods) {
  return (req, res, next) => {
    if (!allowedMethods.includes(req.method)) {
      return res.status(405).json(createError('方法不允许', { allowed: allowedMethods }, 405))
    }
    if (next) return next(req, res)
  }
}

/**
 * 验证用户是否已认证（用于 API 路由）
 * @param {Function} fn - API 处理函数
 * @returns {Function} 包装后的函数
 */
export function requireAuth(fn) {
  return async (req, res) => {
    // 从请求头获取 token
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(createError('未授权访问', null, 401))
    }
    
    const token = authHeader.substring(7)
    
    // TODO: 验证 token 有效性
    // 这里可以集成 Supabase Auth 验证
    
    // 临时方案：从 token 中提取用户 ID（实际应该验证）
    req.user = {
      id: token, // 临时使用 token 作为用户 ID
      token
    }
    
    return fn(req, res)
  }
}

/**
 * 记录 API 请求日志
 * @param {Function} fn - API 处理函数
 * @returns {Function} 包装后的函数
 */
export function withLogging(fn) {
  return async (req, res) => {
    const startTime = Date.now()
    
    console.log('API Request:', {
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString()
    })
    
    // 拦截 res.json 以记录响应时间
    const originalJson = res.json
    res.json = function(data) {
      const duration = Date.now() - startTime
      console.log('API Response:', {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`
      })
      return originalJson.call(this, data)
    }
    
    return fn(req, res)
  }
}

/**
 * 组合多个中间件
 * @param  {...Function} middlewares - 中间件函数列表
 * @returns {Function} 组合后的中间件
 */
export function compose(...middlewares) {
  return (req, res, next) => {
    const stack = [...middlewares]
    
    function run(index) {
      if (index >= stack.length) {
        return next ? next(req, res) : Promise.resolve()
      }
      
      const middleware = stack[index]
      return middleware(req, res, () => run(index + 1))
    }
    
    return run(0)
  }
}

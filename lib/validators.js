/**
 * Zod 输入验证模块
 * 
 * 定义所有 API 请求的验证规则
 */

import { z } from 'zod'

/**
 * 宫殿验证 schema
 */
export const palaceSchema = z.object({
  name: z
    .string()
    .min(1, '宫殿名称不能为空')
    .max(100, '宫殿名称不能超过 100 个字符'),
  description: z
    .string()
    .max(500, '描述不能超过 500 个字符')
    .optional()
})

/**
 * 房间验证 schema
 */
export const roomSchema = z.object({
  name: z
    .string()
    .min(1, '房间名称不能为空')
    .max(100, '房间名称不能超过 100 个字符'),
  description: z
    .string()
    .max(500, '描述不能超过 500 个字符')
    .optional()
})

/**
 * 记忆验证 schema
 */
export const memorySchema = z.object({
  title: z
    .string()
    .min(1, '记忆标题不能为空')
    .max(200, '标题不能超过 200 个字符'),
  content: z
    .string()
    .max(10000, '内容不能超过 10000 个字符')
    .optional(),
  tags: z
    .array(z.string().max(50))
    .max(10, '最多只能有 10 个标签')
    .optional()
})

/**
 * 登录验证 schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, '邮箱不能为空')
    .email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(6, '密码至少需要 6 个字符')
    .max(100, '密码不能超过 100 个字符')
})

/**
 * 注册验证 schema
 */
export const signupSchema = z.object({
  name: z
    .string()
    .min(1, '用户名不能为空')
    .max(50, '用户名不能超过 50 个字符'),
  email: z
    .string()
    .min(1, '邮箱不能为空')
    .email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(6, '密码至少需要 6 个字符')
    .max(100, '密码不能超过 100 个字符')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      '密码必须包含大小写字母和数字'
    )
})

/**
 * 标签验证 schema
 */
export const tagSchema = z.object({
  tag: z
    .string()
    .min(1, '标签不能为空')
    .max(50, '标签不能超过 50 个字符')
})

/**
 * 通用验证函数
 * @param {z.ZodSchema} schema - Zod schema
 * @param {any} data - 待验证数据
 * @returns {{success: boolean, data?: any, error?: any}}
 */
export function validate(schema, data) {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }))
    return {
      success: false,
      error: {
        message: '验证失败',
        details: errors
      }
    }
  }
  
  return {
    success: true,
    data: result.data
  }
}

/**
 * 验证宫殿数据
 */
export function validatePalace(data) {
  return validate(palaceSchema, data)
}

/**
 * 验证房间数据
 */
export function validateRoom(data) {
  return validate(roomSchema, data)
}

/**
 * 验证记忆数据
 */
export function validateMemory(data) {
  return validate(memorySchema, data)
}

/**
 * 验证登录数据
 */
export function validateLogin(data) {
  return validate(loginSchema, data)
}

/**
 * 验证注册数据
 */
export function validateSignup(data) {
  return validate(signupSchema, data)
}

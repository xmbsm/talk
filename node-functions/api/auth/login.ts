/**
 * POST /api/auth/login - 管理员登录
 */
import bcrypt from 'bcryptjs'
import { db, json, generateToken, parseBody } from '../../_lib.js'

export async function onRequestPost(context: { request: Request }) {
  try {
    const { username, password } = await parseBody<{ username: string; password: string }>(context.request)

    if (!username || !password) {
      return json({ success: false, error: '用户名和密码不能为空' }, 400)
    }

    const admin = await (await db()).collection('Admin').findOne({ username })
    if (!admin) {
      return json({ success: false, error: '用户名或密码错误' }, 401)
    }

    const valid = await bcrypt.compare(password, admin.password)
    if (!valid) {
      return json({ success: false, error: '用户名或密码错误' }, 401)
    }

    const token = generateToken(username)

    return json({
      success: true,
      data: { token, username: admin.username },
    })
  } catch (error) {
    console.error('登录失败:', error)
    return json({ success: false, error: '登录失败' }, 500)
  }
}
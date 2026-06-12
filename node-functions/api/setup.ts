/**
 * POST /api/setup - 初始化管理员账号（仅首次部署使用）
 * 请先在 Supabase SQL Editor 中建表
 * 然后调用此接口创建管理员
 *
 * 请求体: { "username": "admin", "password": "your-password" }
 * 不传则默认 admin / admin123
 */
import { pool, json } from '../_lib.js'
import bcrypt from 'bcryptjs'

export async function onRequestPost(context: { request: Request }) {
  try {
    let username = 'admin'
    let password = 'admin123'

    try {
      const body = await context.request.json() as { username?: string; password?: string }
      if (body.username) username = body.username
      if (body.password) password = body.password
    } catch {
      // 无请求体，使用默认值
    }

    if (password.length < 6) {
      return json({ success: false, error: '密码长度不能少于6位' }, 400)
    }

    const existing = await pool.query('SELECT username FROM "Admin" WHERE username = $1', [username])
    if (existing.rows.length > 0) {
      return json({ success: true, message: '管理员已存在，无需初始化' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    await pool.query(
      'INSERT INTO "Admin" (username, password, "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW())',
      [username, hashedPassword]
    )

    return json({
      success: true,
      message: `初始化成功！管理员: ${username}`,
    })
  } catch (error) {
    console.error('初始化失败:', error)
    return json({ success: false, error: String(error) }, 500)
  }
}

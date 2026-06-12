/**
 * GET /api/auth/me - 获取当前管理员信息
 */
import { pool, json, requireAuth } from '../../_lib.js'

export async function onRequestGet(context: { request: Request }) {
  try {
    const auth = requireAuth(context.request)
    if (auth instanceof Response) return auth

    const result = await pool.query('SELECT username FROM "Admin" WHERE username = $1', [auth.username])
    const admin = result.rows[0]
    if (!admin) {
      return json({ success: false, error: '管理员不存在' }, 404)
    }

    return json({
      success: true,
      data: { username: admin.username },
    })
  } catch (error) {
    console.error('获取管理员信息失败:', error)
    return json({ success: false, error: '获取管理员信息失败' }, 500)
  }
}

/**
 * DELETE /api/messages/[id] - 删除留言（需认证）
 */
import { pool, json, requireAuth } from '../../_lib.js'

export async function onRequestDelete(context: { request: Request; params: { id: string } }) {
  try {
    const auth = requireAuth(context.request)
    if (auth instanceof Response) return auth

    const id = Number(context.params.id)
    if (isNaN(id)) {
      return json({ success: false, error: '无效的 ID' }, 400)
    }

    const existing = await pool.query('SELECT id FROM "Message" WHERE id = $1', [id])
    if (existing.rows.length === 0) {
      return json({ success: false, error: '留言不存在' }, 404)
    }

    await pool.query('DELETE FROM "Message" WHERE id = $1', [id])
    return json({ success: true, message: '删除成功' })
  } catch (error) {
    console.error('删除留言失败:', error)
    return json({ success: false, error: '删除留言失败' }, 500)
  }
}

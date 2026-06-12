/**
 * PUT /api/messages/[id]/reply - 回复留言（需认证）
 */
import { pool, json, requireAuth, parseBody } from '../../../_lib.js'

export async function onRequestPut(context: { request: Request; params: { id: string } }) {
  try {
    const auth = requireAuth(context.request)
    if (auth instanceof Response) return auth

    const id = Number(context.params.id)
    if (isNaN(id)) {
      return json({ success: false, error: '无效的 ID' }, 400)
    }

    const { reply } = await parseBody<{ reply: string }>(context.request)
    if (!reply || !reply.trim()) {
      return json({ success: false, error: '回复内容不能为空' }, 400)
    }

    const existing = await pool.query('SELECT id FROM "Message" WHERE id = $1', [id])
    if (existing.rows.length === 0) {
      return json({ success: false, error: '留言不存在' }, 404)
    }

    const result = await pool.query(
      'UPDATE "Message" SET reply = $1, replytime = NOW() WHERE id = $2 RETURNING *',
      [reply.trim(), id]
    )

    return json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('回复留言失败:', error)
    return json({ success: false, error: '回复留言失败' }, 500)
  }
}

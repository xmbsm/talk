/**
 * PUT /api/messages/[id]/reply - 回复留言（需认证）
 */
import { db, json, requireAuth, parseBody, toObjectId } from '../../../_lib.js'

export async function onRequestPut(context: { request: Request; params: { id: string } }) {
  try {
    const auth = requireAuth(context.request)
    if (auth instanceof Response) return auth

    const id = context.params.id
    if (!id) {
      return json({ success: false, error: '无效的 ID' }, 400)
    }

    let objectId
    try {
      objectId = toObjectId(id)
    } catch {
      return json({ success: false, error: '无效的 ID' }, 400)
    }

    const { reply } = await parseBody<{ reply: string }>(context.request)
    if (!reply || !reply.trim()) {
      return json({ success: false, error: '回复内容不能为空' }, 400)
    }

    const existing = await db.collection('Message').findOne({ _id: objectId })
    if (!existing) {
      return json({ success: false, error: '留言不存在' }, 404)
    }

    const result = await db.collection('Message').findOneAndUpdate(
      { _id: objectId },
      { $set: { reply: reply.trim(), replytime: new Date() } },
      { returnDocument: 'after' }
    )

    const formatted = {
      ...result.value,
      id: result.value?._id?.toString() || '',
    }

    return json({ success: true, data: formatted })
  } catch (error) {
    console.error('回复留言失败:', error)
    return json({ success: false, error: '回复留言失败' }, 500)
  }
}
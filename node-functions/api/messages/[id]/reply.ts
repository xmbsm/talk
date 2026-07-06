/**
 * POST /api/messages/[id]/reply - 回复留言
 */
import { db, json, requireAuth, parseBody, toObjectId } from '../../../_lib.js'

export async function onRequestPost(context: { params: { id: string }; request: Request }) {
  try {
    const auth = requireAuth(context.request)
    if (auth instanceof Response) return auth

    const { id } = context.params
    const { content } = await parseBody<{ content: string }>(context.request)

    if (!content) {
      return json({ success: false, error: '回复内容不能为空' }, 400)
    }

    if (content.length > 500) {
      return json({ success: false, error: '回复内容长度不能超过500个字符' }, 400)
    }

    const result = await (await db()).collection('Message').updateOne(
      { _id: toObjectId(id) },
      {
        $push: {
          replies: {
            username: auth.username,
            content,
            createdAt: new Date(),
          },
        },
      }
    )

    if (result.modifiedCount === 0) {
      return json({ success: false, error: '留言不存在' }, 404)
    }

    const message = await (await db()).collection('Message').findOne({ _id: toObjectId(id) })

    return json({
      success: true,
      data: message,
    })
  } catch (error) {
    console.error('回复留言失败:', error)
    return json({ success: false, error: '回复留言失败' }, 500)
  }
}
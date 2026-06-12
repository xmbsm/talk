/**
 * PUT /api/messages/[id]/reply - 回复留言（需认证）
 */
import { prisma, json, requireAuth, parseBody } from '../../../_lib.js'

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

    const existing = await prisma.message.findUnique({ where: { id } })
    if (!existing) {
      return json({ success: false, error: '留言不存在' }, 404)
    }

    const message = await prisma.message.update({
      where: { id },
      data: {
        reply: reply.trim(),
        replytime: new Date(),
      },
    })

    return json({ success: true, data: message })
  } catch (error) {
    console.error('回复留言失败:', error)
    return json({ success: false, error: '回复留言失败' }, 500)
  }
}

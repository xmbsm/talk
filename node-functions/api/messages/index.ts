/**
 * GET /api/messages - 获取留言列表
 * POST /api/messages - 发布留言
 */
import { db, json, parseBody, getClientIp } from '../../_lib.js'

export async function onRequestGet(context: { request: Request }) {
  try {
    const url = new URL(context.request.url)
    const page = parseInt(url.searchParams.get('page') || '1') || 1
    const pageSize = 20
    const skip = (page - 1) * pageSize
    const so = url.searchParams.get('so')

    const query: Record<string, unknown> = {}
    if (so) {
      query.$or = [
        { username: { $regex: so, $options: 'i' } },
        { content: { $regex: so, $options: 'i' } },
      ]
    }

    const messages = await (await db()).collection('Message')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray()

    const total = await (await db()).collection('Message').countDocuments(query)

    return json({
      success: true,
      data: messages,
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('获取留言列表失败:', error)
    return json({ success: false, error: '获取留言列表失败' }, 500)
  }
}

export async function onRequestPost(context: { request: Request }) {
  try {
    const { username, content } = await parseBody<{ username: string; content: string }>(context.request)

    if (!username || !content) {
      return json({ success: false, error: '昵称和内容不能为空' }, 400)
    }

    if (username.length > 20) {
      return json({ success: false, error: '昵称长度不能超过20个字符' }, 400)
    }

    if (content.length > 500) {
      return json({ success: false, error: '内容长度不能超过500个字符' }, 400)
    }

    const ip = getClientIp(context.request)

    const result = await (await db()).collection('Message').insertOne({
      username,
      content,
      ip,
      createdAt: new Date(),
      replies: [] as Array<{
        username: string
        content: string
        createdAt: Date
      }>,
    })

    const newMessage = await (await db()).collection('Message').findOne({ _id: result.insertedId })

    return json({
      success: true,
      data: newMessage,
    })
  } catch (error) {
    console.error('发布留言失败:', error)
    return json({ success: false, error: '发布留言失败' }, 500)
  }
}
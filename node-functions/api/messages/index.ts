/**
 * /api/messages - 留言列表 + 创建留言
 */
import { db, json, parseBody, getClientIp, toObjectId } from '../../_lib.js'

/**
 * GET /api/messages - 留言列表（分页 + 搜索）
 */
export async function onRequestGet(context: { request: Request }) {
  try {
    const url = new URL(context.request.url)
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 50))
    const so = url.searchParams.get('so') || ''

    const offset = (page - 1) * limit

    let query = {}
    if (so) {
      query = {
        $or: [
          { username: { $regex: so, $options: 'i' } },
          { content: { $regex: so, $options: 'i' } },
          { reply: { $regex: so, $options: 'i' } },
        ],
      }
    }

    const [data, total] = await Promise.all([
      db.collection('Message')
        .find(query)
        .sort({ _id: -1 })
        .skip(offset)
        .limit(limit)
        .toArray(),
      db.collection('Message').countDocuments(query),
    ])

    const formattedData = data.map((item) => ({
      ...item,
      id: item._id?.toString() || '',
    }))

    return json({ success: true, data: formattedData, total, page, limit })
  } catch (error) {
    console.error('获取留言列表失败:', error)
    return json({ success: false, error: '获取留言列表失败' }, 500)
  }
}

/**
 * POST /api/messages - 创建留言
 */
export async function onRequestPost(context: { request: Request }) {
  try {
    const { username, content, img } = await parseBody<{ username: string; content: string; img?: string }>(context.request)

    if (!username || !username.trim()) {
      return json({ success: false, error: '用户名不能为空' }, 400)
    }
    if (!content || !content.trim()) {
      return json({ success: false, error: '内容不能为空' }, 400)
    }

    const sanitized = content.replace(/<[^>]*>/g, '')

    if (/https?:\/\//i.test(sanitized)) {
      return json({ success: false, error: '内容不能包含链接' }, 400)
    }

    const ip = getClientIp(context.request)

    let location = ''
    try {
      const resp = await fetch(
        `http://ip-api.com/json/${ip}?lang=zh-CN&fields=regionName,city`,
        { signal: AbortSignal.timeout(3000) }
      )
      if (resp.ok) {
        const data = (await resp.json()) as { regionName?: string; city?: string }
        if (data.regionName || data.city) {
          location = `${data.regionName || ''} ${data.city || ''}`.trim()
        }
      }
    } catch {
      // IP 定位失败不影响留言
    }

    const result = await db.collection('Message').insertOne({
      username: username.trim(),
      content: sanitized.trim(),
      img: img || '',
      dream: '',
      ip,
      ipLocation: location,
      posttime: new Date(),
    })

    const inserted = await db.collection('Message').findOne({ _id: result.insertedId })
    const formatted = {
      ...inserted,
      id: inserted?._id?.toString() || '',
    }

    return json({ success: true, data: formatted }, 201)
  } catch (error) {
    console.error('创建留言失败:', error)
    return json({ success: false, error: '创建留言失败' }, 500)
  }
}
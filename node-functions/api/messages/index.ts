/**
 * /api/messages - 留言列表 + 创建留言
 */
import { prisma, json, parseBody, getClientIp } from '../../_lib.js'

/**
 * GET /api/messages - 留言列表（分页 + 搜索）
 */
export async function onRequestGet(context: { request: Request }) {
  try {
    const url = new URL(context.request.url)
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 50))
    const so = url.searchParams.get('so') || ''

    const where = so
      ? {
          OR: [
            { username: { contains: so, mode: 'insensitive' as const } },
            { content: { contains: so, mode: 'insensitive' as const } },
            { reply: { contains: so, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [data, total] = await Promise.all([
      prisma.message.findMany({
        where,
        orderBy: { id: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.message.count({ where }),
    ])

    return json({ success: true, data, total, page, limit })
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

    // 清理 HTML 标签
    const sanitized = content.replace(/<[^>]*>/g, '')

    // 拒绝包含链接的内容（防垃圾）
    if (/https?:\/\//i.test(sanitized)) {
      return json({ success: false, error: '内容不能包含链接' }, 400)
    }

    // 获取 IP
    const ip = getClientIp(context.request)

    // 获取 IP 地理位置
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

    const message = await prisma.message.create({
      data: {
        username: username.trim(),
        content: sanitized.trim(),
        img: img || '',
        dream: '',
        ip,
        ipLocation: location,
      },
    })

    return json({ success: true, data: message }, 201)
  } catch (error) {
    console.error('创建留言失败:', error)
    return json({ success: false, error: '创建留言失败' }, 500)
  }
}

/**
 * POST /api/messages - 创建留言
 */
import { prisma, json, parseBody, getClientIp } from '../../_lib.js'

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

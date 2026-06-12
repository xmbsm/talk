import { Router, type Request, type Response } from 'express'
import prisma from '../lib/prisma.js'
import { authMiddleware, type AuthRequest } from '../lib/auth.js'

const router = Router()

/**
 * GET /api/messages - 留言列表（分页 + 搜索）
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50))
    const so = (req.query.so as string) || ''

    const where = so
      ? {
          OR: [
            { username: { contains: so } },
            { content: { contains: so } },
            { reply: { contains: so } },
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

    res.json({ success: true, data, total, page, limit })
  } catch (error) {
    console.error('获取留言列表失败:', error)
    res.status(500).json({ success: false, error: '获取留言列表失败' })
  }
})

/**
 * POST /api/messages - 创建留言
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, content, img } = req.body

    if (!username || !username.trim()) {
      res.status(400).json({ success: false, error: '用户名不能为空' })
      return
    }
    if (!content || !content.trim()) {
      res.status(400).json({ success: false, error: '内容不能为空' })
      return
    }

    // 清理 HTML 标签
    const sanitized = content.replace(/<[^>]*>/g, '')

    // 拒绝包含链接的内容（防垃圾）
    if (/https?:\/\//i.test(sanitized)) {
      res.status(400).json({ success: false, error: '内容不能包含链接' })
      return
    }

    // 获取 IP
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '127.0.0.1'

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

    res.status(201).json({ success: true, data: message })
  } catch (error) {
    console.error('创建留言失败:', error)
    res.status(500).json({ success: false, error: '创建留言失败' })
  }
})

/**
 * DELETE /api/messages/:id - 删除留言（需认证）
 */
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: '无效的 ID' })
      return
    }

    const existing = await prisma.message.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ success: false, error: '留言不存在' })
      return
    }

    await prisma.message.delete({ where: { id } })
    res.json({ success: true, message: '删除成功' })
  } catch (error) {
    console.error('删除留言失败:', error)
    res.status(500).json({ success: false, error: '删除留言失败' })
  }
})

/**
 * PUT /api/messages/:id/reply - 回复留言（需认证）
 */
router.put('/:id/reply', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: '无效的 ID' })
      return
    }

    const { reply } = req.body
    if (!reply || !reply.trim()) {
      res.status(400).json({ success: false, error: '回复内容不能为空' })
      return
    }

    const existing = await prisma.message.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ success: false, error: '留言不存在' })
      return
    }

    const message = await prisma.message.update({
      where: { id },
      data: {
        reply: reply.trim(),
        replytime: new Date(),
      },
    })

    res.json({ success: true, data: message })
  } catch (error) {
    console.error('回复留言失败:', error)
    res.status(500).json({ success: false, error: '回复留言失败' })
  }
})

export default router

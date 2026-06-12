/**
 * POST /api/upload/remote - 获取远程图片并保存到 COS
 */
import { json, parseBody } from '../../_lib.js'
import { uploadToCos } from '../../_cos.js'

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

function generateFilename(ext: string): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  return `uploads/${timestamp}-${random}${ext}`
}

function getExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase()?.replace(/[^a-z]/g, '') || 'jpg'
}

export async function onRequestPost(context: { request: Request }) {
  try {
    const { url: imageUrl } = await parseBody<{ url: string }>(context.request)
    if (!imageUrl || !imageUrl.trim()) {
      return json({ success: false, error: '请提供图片 URL' }, 400)
    }

    // 验证 URL 格式
    let parsedUrl: URL
    try {
      parsedUrl = new URL(imageUrl)
    } catch {
      return json({ success: false, error: 'URL 格式无效' }, 400)
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return json({ success: false, error: '仅支持 http/https 协议' }, 400)
    }

    // 获取远程图片
    const resp = await fetch(imageUrl, {
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })

    if (!resp.ok) {
      return json({ success: false, error: '无法获取远程图片' }, 400)
    }

    // 验证是否为图片
    const contentType = resp.headers.get('content-type') || ''
    const isImage = ALLOWED_MIMES.some((mime) => contentType.includes(mime))
    const urlExt = getExtension(parsedUrl.pathname)
    const isValidExt = ALLOWED_EXTENSIONS.includes(`.${urlExt}`)

    if (!isImage && !isValidExt) {
      return json({ success: false, error: '远程文件不是有效的图片' }, 400)
    }

    const ext = isValidExt ? urlExt : 'jpg'
    const filename = generateFilename(`.${ext}`)
    const arrayBuffer = await resp.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await uploadToCos(filename, buffer)

    return json({
      success: true,
      data: { filename: result.filename, url: result.url },
    }, 201)
  } catch (error) {
    console.error('获取远程图片失败:', error)
    return json({ success: false, error: '获取远程图片失败' }, 500)
  }
}

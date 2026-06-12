/**
 * POST /api/upload/remote - 验证远程图片 URL 并直接使用
 */
import { json, parseBody } from '../../_lib.js'

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp']

function getExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase()?.replace(/[^a-z]/g, '') || ''
}

export async function onRequestPost(context: { request: Request }) {
  try {
    const { url: imageUrl } = await parseBody<{ url: string }>(context.request)
    if (!imageUrl || !imageUrl.trim()) {
      return json({ success: false, error: '请提供图片 URL' }, 400)
    }

    // 验证 URL 格式
    try {
      const parsedUrl = new URL(imageUrl)
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return json({ success: false, error: '仅支持 http/https 协议' }, 400)
      }
    } catch {
      return json({ success: false, error: 'URL 格式无效' }, 400)
    }

    // 验证扩展名（无扩展名也允许，仅做提示）
    const urlExt = getExtension(imageUrl)

    return json({
      success: true,
      data: { filename: urlExt || 'jpg', url: imageUrl.trim() },
    }, 201)
  } catch (error) {
    console.error('验证远程图片失败:', error)
    return json({ success: false, error: '验证远程图片失败' }, 500)
  }
}

/**
 * DELETE /api/upload/[filename] - 删除图片（需认证）
 */
import { json, requireAuth } from '../../_lib.js'
import { deleteFromCos } from '../../_cos.js'

export async function onRequestDelete(context: { request: Request; params: { filename: string } }) {
  try {
    const auth = requireAuth(context.request)
    if (auth instanceof Response) return auth

    const { filename } = context.params

    // 防止路径遍历攻击
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return json({ success: false, error: '无效的文件名' }, 400)
    }

    await deleteFromCos(`uploads/${filename}`)
    return json({ success: true, message: '删除成功' })
  } catch (error) {
    console.error('删除图片失败:', error)
    return json({ success: false, error: '删除图片失败' }, 500)
  }
}

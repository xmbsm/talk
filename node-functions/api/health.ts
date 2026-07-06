/**
 * GET /api/health - 健康检查
 */
import { json } from '../_lib.js'

export async function onRequest(context: { request: Request }) {
  return json({ success: true, message: 'ok' })
}
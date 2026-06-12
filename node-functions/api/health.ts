/**
 * GET /api/health - 健康检查
 */
import { json } from '../_lib.js'

export async function onRequestGet() {
  return json({ success: true, message: 'ok' })
}

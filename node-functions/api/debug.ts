/**
 * GET /api/debug - 诊断接口，排查数据库连接问题
 * 部署后访问一次，排查完毕后删除此文件
 */
import { pool, json } from '../_lib.js'

export async function onRequestGet() {
  const results: Record<string, unknown> = {}

  // 1. 检查环境变量
  results.env = {
    DATABASE_URL_set: !!process.env.DATABASE_URL,
    DATABASE_URL_prefix: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.replace(/:([^@]+)@/, ':****@')
      : 'NOT SET',
    JWT_SECRET_set: !!process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV || 'not set',
  }

  // 2. 测试数据库连接
  try {
    const adminResult = await pool.query('SELECT COUNT(*)::int AS count FROM "Admin"')
    const messageResult = await pool.query('SELECT COUNT(*)::int AS count FROM "Message"')
    results.database = {
      connected: true,
      adminCount: adminResult.rows[0].count,
      messageCount: messageResult.rows[0].count,
    }
  } catch (error: unknown) {
    results.database = {
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }

  return json(results)
}

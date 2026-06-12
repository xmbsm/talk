/**
 * GET /api/debug - 诊断接口，排查数据库连接问题
 * 部署后访问一次，排查完毕后删除此文件
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

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
    const connectionString = process.env.DATABASE_URL!
    const pool = new pg.Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    const prisma = new PrismaClient({ adapter })
    const adminCount = await prisma.admin.count()
    const messageCount = await prisma.message.count()
    await prisma.$disconnect()
    results.database = {
      connected: true,
      adminCount,
      messageCount,
    }
  } catch (error: unknown) {
    results.database = {
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

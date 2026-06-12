/**
 * EdgeOne Node Functions 共享工具库
 * 使用 Prisma + pg driver adapter（无需原生二进制引擎）
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'xinwenyi-talk-secret-key'

// Prisma 单例（避免 Serverless 冷启动创建多个连接）
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set')
  }

  const pool = new pg.Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma || createPrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// JWT 工具
export function generateToken(username: string): string {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { username: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { username: string }
  } catch {
    return null
  }
}

// 统一响应
export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

// 从请求中获取认证信息
export function getAuth(request: Request): { username: string } | null {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  return verifyToken(token)
}

// 要求认证，返回用户名或 null
export function requireAuth(request: Request): { username: string } | Response {
  const auth = getAuth(request)
  if (!auth) {
    return json({ success: false, error: '未登录' }, 401)
  }
  return auth
}

// 解析 JSON 请求体
export async function parseBody<T = unknown>(request: Request): Promise<T> {
  return request.json() as Promise<T>
}

// 获取客户端 IP
export function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return '127.0.0.1'
}

/**
 * EdgeOne Node Functions 共享工具库
 * 直接使用 pg 驱动，不依赖 Prisma 原生引擎
 */
import pg from 'pg'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'xinwenyi-talk-secret-key'

// pg 连接池单例
const globalForPg = globalThis as unknown as { pool: pg.Pool }
export const pool: pg.Pool = globalForPg.pool || new pg.Pool({ connectionString: process.env.DATABASE_URL })
if (process.env.NODE_ENV !== 'production') globalForPg.pool = pool

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

// 要求认证
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

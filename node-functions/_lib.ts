/**
 * EdgeOne Node Functions 共享工具库
 * 使用 MongoDB 驱动（延迟初始化，避免顶层 await）
 */
import { MongoClient, type Db, type ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'xinwenyi-talk-secret-key'

let _db: Db | null = null

async function getDb(): Promise<Db> {
  if (_db) return _db

  const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/talk'
  const client = new MongoClient(uri)

  await client.connect()
  // 从连接字符串中提取数据库名，若未指定则使用 'talk'
  const dbName = new URL(uri.replace('mongodb+srv://', 'https://').replace('mongodb://', 'https://')).pathname.slice(1) || 'talk'
  _db = client.db(dbName)
  return _db
}

export async function db(): Promise<Db> {
  return getDb()
}

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

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

export function getAuth(request: Request): { username: string } | null {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  return verifyToken(token)
}

export function requireAuth(request: Request): { username: string } | Response {
  const auth = getAuth(request)
  if (!auth) {
    return json({ success: false, error: '未登录' }, 401)
  }
  return auth
}

export async function parseBody<T = unknown>(request: Request): Promise<T> {
  return request.json() as Promise<T>
}

export function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return '127.0.0.1'
}

export function toObjectId(id: string): ObjectId {
  return new ObjectId(id)
}
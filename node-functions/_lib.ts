/**
 * EdgeOne Node Functions 共享工具库
 * 使用 MongoDB 驱动
 */
import { MongoClient, type Db, type ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'xinwenyi-talk-secret-key'

const globalForMongo = globalThis as unknown as { client: MongoClient; db: Db }

export let db: Db

async function connect(): Promise<void> {
  if (globalForMongo.db) {
    db = globalForMongo.db
    return
  }

  const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/talk'
  const client = new MongoClient(uri)
  
  await client.connect()
  globalForMongo.client = client
  globalForMongo.db = client.db()
  db = globalForMongo.db
}

await connect()

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
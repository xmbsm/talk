/**
 * POST /api/setup - 初始化管理员账号（仅首次部署使用）
 * 请先在本地运行 npx prisma db push --schema=prisma/schema.prisma 建表
 * 然后调用此接口创建管理员
 *
 * 请求体: { "username": "admin", "password": "your-password" }
 * 不传则默认 admin / admin123
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { json } from '../_lib.js'

export async function onRequestPost(context: { request: Request }) {
  try {
    const prisma = new PrismaClient()

    let username = 'admin'
    let password = 'admin123'

    try {
      const body = await context.request.json() as { username?: string; password?: string }
      if (body.username) username = body.username
      if (body.password) password = body.password
    } catch {
      // 无请求体，使用默认值
    }

    if (password.length < 6) {
      await prisma.$disconnect()
      return json({ success: false, error: '密码长度不能少于6位' }, 400)
    }

    const existing = await prisma.admin.findUnique({ where: { username } })
    if (existing) {
      await prisma.$disconnect()
      return json({ success: true, message: '管理员已存在，无需初始化' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    await prisma.admin.create({
      data: { username, password: hashedPassword },
    })

    await prisma.$disconnect()
    return json({
      success: true,
      message: `初始化成功！管理员: ${username}`,
    })
  } catch (error) {
    console.error('初始化失败:', error)
    return json({ success: false, error: String(error) }, 500)
  }
}

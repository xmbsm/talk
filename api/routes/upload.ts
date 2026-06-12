import { Router, type Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { authMiddleware, type AuthRequest } from '../lib/auth.js'

const router = Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsDir = path.join(__dirname, '..', '..', 'uploads')

// 确保 uploads 目录存在
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// 允许的图片类型
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

// 生成唯一文件名
function generateFilename(ext: string): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  return `${timestamp}-${random}${ext}`
}

// 获取文件扩展名
function getExtension(filename: string): string {
  return path.extname(filename).toLowerCase()
}

// multer 配置
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (_req, file, cb) => {
    const ext = getExtension(file.originalname)
    cb(null, generateFilename(ext))
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    const ext = getExtension(file.originalname)
    if (ALLOWED_MIMES.includes(file.mimetype) && ALLOWED_EXTENSIONS.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('仅支持 jpg/jpeg/png/gif/webp 格式的图片'))
    }
  },
})

/**
 * POST /api/upload - 上传图片
 */
router.post('/', upload.single('file'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: '请选择要上传的图片' })
      return
    }

    res.status(201).json({
      success: true,
      data: {
        filename: req.file.filename,
        url: `/uploads/${req.file.filename}`,
      },
    })
  } catch (error) {
    console.error('上传图片失败:', error)
    res.status(500).json({ success: false, error: '上传图片失败' })
  }
})

/**
 * POST /api/upload/remote - 获取远程图片并保存
 */
router.post('/remote', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { url } = req.body
    if (!url || !url.trim()) {
      res.status(400).json({ success: false, error: '请提供图片 URL' })
      return
    }

    // 验证 URL 格式
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      res.status(400).json({ success: false, error: 'URL 格式无效' })
      return
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      res.status(400).json({ success: false, error: '仅支持 http/https 协议' })
      return
    }

    // 获取远程图片
    const resp = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })

    if (!resp.ok) {
      res.status(400).json({ success: false, error: '无法获取远程图片' })
      return
    }

    // 验证是否为图片
    const contentType = resp.headers.get('content-type') || ''
    const isImage = ALLOWED_MIMES.some((mime) => contentType.includes(mime))

    // 从 URL 获取扩展名
    const urlExt = getExtension(parsedUrl.pathname)
    const isValidExt = ALLOWED_EXTENSIONS.includes(urlExt)

    if (!isImage && !isValidExt) {
      res.status(400).json({ success: false, error: '远程文件不是有效的图片' })
      return
    }

    const ext = isValidExt ? urlExt : '.jpg'
    const filename = generateFilename(ext)
    const filepath = path.join(uploadsDir, filename)

    const arrayBuffer = await resp.arrayBuffer()
    fs.writeFileSync(filepath, Buffer.from(arrayBuffer))

    res.status(201).json({
      success: true,
      data: {
        filename,
        url: `/uploads/${filename}`,
      },
    })
  } catch (error) {
    console.error('获取远程图片失败:', error)
    res.status(500).json({ success: false, error: '获取远程图片失败' })
  }
})

/**
 * DELETE /api/upload/:filename - 删除图片（需认证）
 */
router.delete('/:filename', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { filename } = req.params

    // 防止路径遍历攻击
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      res.status(400).json({ success: false, error: '无效的文件名' })
      return
    }

    const filepath = path.join(uploadsDir, filename)

    if (!fs.existsSync(filepath)) {
      res.status(404).json({ success: false, error: '文件不存在' })
      return
    }

    fs.unlinkSync(filepath)
    res.json({ success: true, message: '删除成功' })
  } catch (error) {
    console.error('删除图片失败:', error)
    res.status(500).json({ success: false, error: '删除图片失败' })
  }
})

export default router

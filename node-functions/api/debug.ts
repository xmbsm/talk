/**
 * GET /api/debug - 最小化诊断接口（不依赖任何外部模块）
 */
export async function onRequest(context: { request: Request }) {
  return new Response(JSON.stringify({
    success: true,
    message: 'debug ok - no external deps',
    method: context.request.method,
    url: context.request.url,
    env_DATABASE_URL: !!process.env.DATABASE_URL,
    env_JWT_SECRET: !!process.env.JWT_SECRET,
  }), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}
/**
 * GET /api/debug - 诊断接口（不依赖任何外部模块）
 */
export async function onRequest(context) {
  return new Response(JSON.stringify({
    success: true,
    message: 'debug ok',
    method: context.request.method,
    env_DATABASE_URL: !!process.env.DATABASE_URL,
    env_JWT_SECRET: !!process.env.JWT_SECRET,
  }), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}
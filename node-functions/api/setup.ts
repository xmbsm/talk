/**
 * GET/POST /api/setup - 诊断接口（不依赖任何外部模块）
 */
export async function onRequest(context) {
  return new Response(JSON.stringify({
    success: true,
    message: 'setup ok',
    method: context.request.method,
  }), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}
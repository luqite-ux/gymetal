import { createSupabaseCaptchaContextFromEnv, verifyCaptchaSubmission } from '@/lib/inquiry-captcha'
import { stripHeaderUnsafeEnv } from '@/lib/env-strip'

export const dynamic = 'force-dynamic'
const headers = { 'cache-control': 'no-store' }
const text = (value: unknown, maximum: number) => typeof value === 'string' ? value.trim().slice(0, maximum) : ''

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const secret = stripHeaderUnsafeEnv(process.env.CAPTCHA_SECRET)
  if (!secret) return Response.json({ error: 'Verification service is temporarily unavailable.' }, { status: 503, headers })
  try {
    const captcha = await verifyCaptchaSubmission({
      secret,
      ...createSupabaseCaptchaContextFromEnv(),
      scope: text(body?.captchaScope, 160),
      token: text(body?.captchaToken, 4096),
      answer: text(body?.captchaAnswer, 16),
    })
    if (!captcha.ok) return Response.json({ error: 'The verification code is incorrect or expired. Please try again.' }, { status: 400, headers })
  } catch {
    return Response.json({ error: 'Verification service is temporarily unavailable.' }, { status: 503, headers })
  }
  const tenantId = stripHeaderUnsafeEnv(process.env.NEXT_PUBLIC_TENANT_ID) ?? ''
  const supabaseUrl = stripHeaderUnsafeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL)?.replace(/\/+$/, '') ?? ''
  const serviceRoleKey = stripHeaderUnsafeEnv(process.env.SUPABASE_SERVICE_ROLE_KEY) ?? ''
  const inquiry = {
    tenant_id: tenantId,
    name: text(body?.name, 200), email: text(body?.email, 320), phone: text(body?.phone, 80) || null,
    company: text(body?.company, 200) || null, subject: text(body?.subject ?? body?.product, 300) || null,
    message: text(body?.message, 10000), status: 'unread',
  }
  if (!tenantId || !supabaseUrl || !serviceRoleKey || !inquiry.name || !inquiry.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email)) return Response.json({ error: 'Please complete all required inquiry fields.' }, { status: 400, headers })
  const response = await fetch(`${supabaseUrl}/rest/v1/inquiries?select=id`, { method: 'POST', headers: { apikey: serviceRoleKey, authorization: `Bearer ${serviceRoleKey}`, 'content-type': 'application/json', prefer: 'return=representation' }, body: JSON.stringify(inquiry), cache: 'no-store' })
  if (!response.ok) return Response.json({ error: 'Submission failed. Please try again.' }, { status: 503, headers })
  const rows = await response.json().catch(() => []) as Array<{ id?: string }>
  const inquiryId = rows.length === 1 ? text(rows[0]?.id, 100) : ''
  if (!inquiryId) return Response.json({ error: 'Submission failed. Please try again.' }, { status: 503, headers })
  const notifySecret = stripHeaderUnsafeEnv(process.env.INQUIRY_NOTIFY_SECRET)
  const adminUrl = stripHeaderUnsafeEnv(process.env.HUANQIU_ADMIN_URL ?? process.env.NEXT_PUBLIC_ADMIN_URL)?.replace(/\/$/, '')
  if (notifySecret && adminUrl) {
    await fetch(`${adminUrl}/api/inquiries/notify`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-inquiry-notify-secret': notifySecret }, body: JSON.stringify({ tenantId, inquiryId }), cache: 'no-store' }).catch(() => null)
  }
  return Response.json({ ok: true, id: inquiryId }, { status: 201, headers })
}

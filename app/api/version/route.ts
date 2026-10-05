import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const commit = process.env.DEPLOYMENT_COMMIT_SHA?.trim() || 'unknown'

  return NextResponse.json(
    {
      service: 'gymetaltech.com',
      commit,
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  )
}

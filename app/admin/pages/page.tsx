import { redirect } from 'next/navigation'
import { requireAdminSession } from '@/lib/admin-auth'

export default async function PagesPage() {
  await requireAdminSession()
  redirect('/admin/content')
}

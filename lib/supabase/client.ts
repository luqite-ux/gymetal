import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // TODO: 临时硬编码用于测试，测试完需要改回环境变量
  return createBrowserClient(
    'https://kznqbvcyehtjcsgkurso.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6bnFidmN5ZWh0amNzZ2t1cnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NTAxNjEsImV4cCI6MjA5MDUyNjE2MX0.Agcw-V6k4wxyfcn4jrzuYlft0lVpBSSbIltyRLXd5e0',
  )
}

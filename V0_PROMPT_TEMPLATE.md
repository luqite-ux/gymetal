# V0 标准提示词模板

每次用 V0 做新客户网站时，复制以下提示词并替换 `{{}}` 中的内容。

---

## 完整提示词

```
帮我用 Next.js 14 App Router + Supabase + shadcn/ui + Tailwind CSS 构建【{{客户名称}}】的企业网站，
同时包含前台展示和后台管理系统（/admin 路由）。

【行业与产品】
{{客户行业描述，例如：精密金属加工，主要产品：CNC零件、铸件、锻件}}

【前台页面】
- 首页（英雄区 + 关于我们 + 服务 + 产品展示 + 联系我们）
- 产品页（列表）
- 关于我们
- 联系我们（带询盘表单）
- {{按需添加其他页面}}

【后台管理模块（/admin 路由）】
需要管理以下模块，每个模块包含列表、新增、编辑、删除：
- 产品管理
- 询盘管理（查看联系表单提交）
- 文章/新闻管理
- 页面内容编辑（首页、关于我们等关键文案）
- 网站设置（联系方式、社交媒体、SEO 信息）

【技术要求】
- 数据库：已有 Supabase 项目，连接同一个数据库
- 多租户：所有表都有 tenant_id 字段区分不同网站的数据
- 环境变量：
  NEXT_PUBLIC_SUPABASE_URL=（已有）
  NEXT_PUBLIC_SUPABASE_ANON_KEY=（已有）
  SUPABASE_SERVICE_ROLE_KEY=（已有）
- 管理员认证：自定义 session 表（admin_sessions），Cookie 存 token，不使用 Supabase Auth
- 文件上传：Cloudflare R2（环境变量：R2_BUCKET_NAME, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_S3_ENDPOINT, R2_PUBLIC_URL_PREFIX）
- 国际化：内容字段支持中英双语（字段名加 _en 后缀，如 name/name_en）

【数据库表（已存在，直接用）】
- tenants（id, email, password_hash, domain, site_name）
- products（id, tenant_id, name, name_en, description, description_en, image_url, category, sort_order, is_active）
- articles（id, tenant_id, title, title_en, slug, content, content_en, excerpt, excerpt_en, featured_image, is_published）
- inquiries（id, tenant_id, name, email, phone, company, subject, message, status）
- pages（id, tenant_id, page_key, content jsonb）
- settings（id, tenant_id, site_title, site_title_en, contact_email, contact_phone, contact_address, logo_url 等）
- admin_sessions（id, tenant_id, token, expires_at）

【参考以下核心文件结构（直接复用，无需重写）】

lib/supabase/server.ts：
\`\`\`ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (cs) => { try { cs.forEach(({name,value,options}) => cookieStore.set(name,value,options)) } catch {} } } }
  )
}

export async function createAdminClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (cs) => { try { cs.forEach(({name,value,options}) => cookieStore.set(name,value,options)) } catch {} } } }
  )
}
\`\`\`

lib/admin-auth.ts 中的核心逻辑：
- hashPassword / verifyPassword（bcryptjs，rounds=12）
- createAdminSession（写入 admin_sessions 表，设置 httpOnly Cookie）
- getAdminSession（验证 Cookie token，返回 TenantSession）
- destroyAdminSession（删除 session 记录，清除 Cookie）
- requireAdminSession（未登录则 redirect 到 /admin/login）

【设计风格】
{{例如：专业工业风，深色调，蓝灰配色}}

【语言】
中英双语切换，默认显示中文。
```

---

## 接入已有项目的步骤

新项目生成代码后，只需做：

1. **复制 lib 目录核心文件**（直接从 GY 项目复制，无需改动）：
   - `lib/supabase/server.ts`
   - `lib/supabase/client.ts`
   - `lib/admin-auth.ts`
   - `lib/r2.ts`（如果需要图片上传）

2. **设置环境变量**（`.env.local`）：
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://kznqbvcyehtjcsgkurso.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=（从 GY 项目复制）
   SUPABASE_SERVICE_ROLE_KEY=（从 GY 项目复制）
   R2_BUCKET_NAME=aiosshemei
   R2_ACCESS_KEY_ID=（从 GY 项目复制）
   R2_SECRET_ACCESS_KEY=（从 GY 项目复制）
   R2_S3_ENDPOINT=（从 GY 项目复制）
   R2_PUBLIC_URL_PREFIX=（从 GY 项目复制）
   ```

3. **在 Supabase 添加新租户**：
   ```bash
   # 1. 生成密码哈希
   node scripts/hash-password.js <新密码>
   
   # 2. 在 Supabase SQL Editor 运行 scripts/add-new-tenant.sql
   #    （替换变量后执行）
   ```

4. **部署到 Vercel**：
   - 新建 Vercel 项目，连接新代码仓库
   - 设置同样的环境变量
   - 绑定客户域名

---

## 可复用文件一览

| 文件 | 复用程度 | 说明 |
|------|---------|------|
| `lib/supabase/server.ts` | 100% | 直接复制 |
| `lib/supabase/client.ts` | 100% | 直接复制 |
| `lib/admin-auth.ts` | 100% | 直接复制 |
| `lib/r2.ts` | 100% | 直接复制 |
| `app/admin/layout.tsx` | 100% | 直接复制 |
| `app/admin/login/page.tsx` | 100% | 直接复制 |
| `app/admin/login/actions.ts` | 100% | 直接复制 |
| `app/admin/logout/actions.ts` | 100% | 直接复制 |
| `scripts/001_create_tables.sql` | 100% | 数据库表结构，只需在新项目执行一次 |
| `components/admin/sidebar.tsx` | 80% | 改 navItems 数组即可 |
| `app/admin/page.tsx` | 70% | 改统计模块 |
| `app/admin/products/` | 50% | 按新客户产品字段调整 |
| `app/admin/settings/` | 90% | 改字段名称即可 |

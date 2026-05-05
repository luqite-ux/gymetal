-- ============================================================
-- 新客户接入模板 - 每次新项目复制这个文件并替换变量
-- ============================================================
-- 替换以下变量：
--   {{TENANT_ID}}    - 新建一个 UUID（可用 gen_random_uuid() 或在线生成）
--   {{EMAIL}}        - 客户管理员邮箱，也是登录账号
--   {{PASSWORD_HASH}} - 用 bcrypt 生成（rounds=12），或运行 scripts/hash-password.js
--   {{DOMAIN}}       - 客户网站域名，如 client.com
--   {{SITE_NAME}}    - 网站名称，如 "XX公司官网"
-- ============================================================

-- Step 1：创建租户（管理员账号）
INSERT INTO tenants (id, email, password_hash, domain, name)
VALUES (
  '{{TENANT_ID}}',
  '{{EMAIL}}',
  '{{PASSWORD_HASH}}',
  '{{DOMAIN}}',
  '{{SITE_NAME}}'
);

-- Step 2：初始化网站设置
INSERT INTO settings (
  tenant_id,
  site_title,
  site_title_en,
  site_description,
  site_description_en,
  contact_email
)
VALUES (
  '{{TENANT_ID}}',
  '{{SITE_NAME}}',
  '{{SITE_NAME_EN}}',
  '{{SITE_DESCRIPTION}}',
  '{{SITE_DESCRIPTION_EN}}',
  '{{EMAIL}}'
);

-- Step 3：初始化首页内容（按需修改）
INSERT INTO pages (tenant_id, page_key, content)
VALUES (
  '{{TENANT_ID}}',
  'home',
  '{
    "hero_title": "{{HERO_TITLE}}",
    "hero_title_en": "{{HERO_TITLE_EN}}",
    "hero_subtitle": "{{HERO_SUBTITLE}}",
    "hero_subtitle_en": "{{HERO_SUBTITLE_EN}}"
  }'::jsonb
);

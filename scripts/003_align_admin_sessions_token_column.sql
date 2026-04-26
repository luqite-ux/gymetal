-- 若早期建表使用了 session_token，而代码使用 token，PostgREST 会报 PGRST204（schema cache 无 token 列）
-- 在 Supabase：SQL Editor → 粘贴本文件 → Run

DO $$
BEGIN
  IF to_regclass('public.admin_sessions') IS NULL THEN
    RAISE NOTICE '表 admin_sessions 不存在，请先执行 scripts/001_create_tables.sql';
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'admin_sessions' AND column_name = 'session_token'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'admin_sessions' AND column_name = 'token'
  ) THEN
    ALTER TABLE public.admin_sessions RENAME COLUMN session_token TO token;
    RAISE NOTICE '已将 session_token 重命名为 token';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'admin_sessions' AND column_name = 'token'
  ) THEN
    RAISE NOTICE '列 token 已存在，无需修改';
  ELSE
    RAISE NOTICE '未找到 session_token 或 token，请检查表结构或重新执行 001';
  END IF;
END $$;

-- 如索引仍指向旧名，可重建（一般重命名列后 Postg 会自动用新列，可选）
-- DROP INDEX IF EXISTS idx_admin_sessions_token;
-- CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions(token);

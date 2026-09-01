-- SupabaseのSQL Editorで、これをそのまま実行してください。
-- 質問と回答の履歴を保存するテーブルを作ります。

create table if not exists public.chat_logs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text,
  created_at timestamptz not null default now()
);

-- 補足：
-- このテーブルへの読み書きは、Webアプリ側からは
-- SUPABASE_SERVICE_ROLE_KEY（秘密鍵。サーバー側の環境変数にのみ設定し、
-- ブラウザには絶対に渡さない）経由でのみ行う想定です。
-- service_role キーはRLS（行レベルセキュリティ）を無視してアクセスできるため、
-- このテーブルでRLSを有効化していなくても、外部から直接読み書きされることはありません。
-- 万が一に備えてRLSを有効化しておきたい場合は、以下も実行してください。
--
-- alter table public.chat_logs enable row level security;

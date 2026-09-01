# mew-agent（分身AIエージェント）

引き継ぎ用の知識をもとに、社員からの質問にAIが答える社内向けWebアプリの雛形。
社内の数人チームでの利用を想定し、ログイン機能はありません。

## 構成
- Next.js（App Router）+ TypeScript
- Gemini API（有料枠）
- 質問と回答の履歴をSupabaseに記録

## 知識ベースの場所
`/knowledge` フォルダの中の `.md` ファイルをすべて読み込み、
AIへの指示（システムプロンプト）としてまとめて渡す仕組みになっている。

**分類方法やファイル名は自由に変えてOK。** APIルート（`app/api/chat/route.ts`）は
「`/knowledge` フォルダの中の `.md` を全部読む」という実装になっているだけなので、
ファイルを増やす・分割する・統合するのを、コードを直さずに何度でもやり直せる。

## Supabaseの準備

1. Supabaseでプロジェクトを作成する（未作成の場合）
2. SupabaseのSQL Editorを開き、`supabase/schema.sql` の中身をそのまま実行する
   （`chat_logs` テーブルが作られる）
3. Supabaseダッシュボードの Project Settings > API から、以下をメモしておく
   - Project URL → `SUPABASE_URL`
   - `service_role` キー（`anon` キーではない方）→ `SUPABASE_SERVICE_ROLE_KEY`

## ローカルでの動かし方

1. 依存パッケージをインストール
   ```
   npm install
   ```

2. 環境変数を設定
   ```
   cp .env.example .env.local
   ```
   `.env.local` を開いて、以下を埋める。
   - `GEMINI_API_KEY`：Google AI Studioで発行した**有料枠**のAPIキー
     （無料枠は入力内容がGoogle側の学習に使われる契約になっているため、
     社内情報を扱う用途では使わないこと）
   - `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`：上記で控えた値

3. 起動
   ```
   npm run dev
   ```
   `http://localhost:3000` にアクセスして動作確認する。質問すると、
   Supabaseの `chat_logs` テーブルに質問・回答・日時が記録される。

## Vercelへのデプロイ

1. このプロジェクトをGitHubリポジトリにpushする
2. Vercelで「Import Project」からそのリポジトリを選ぶ
3. Vercelの管理画面の「Environment Variables」に、`.env.local` と同じ内容を登録する
   （`GEMINI_API_KEY` / `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`）
4. Deployを実行すると、`https://（プロジェクト名）.vercel.app` のようなURLが発行される
5. そのURLを社内のチームメンバーに共有する

## 既知の制約（今後の改善候補）

- **ログイン機能・利用回数の制限なし**：URLを知っている人なら誰でも、無制限に
  アクセスできる。数人のチーム利用が前提だが、URLの取り扱いには注意する
  （不特定多数に共有しない）。想定外にアクセスが増えた場合、Gemini APIの
  従量課金コストがそのまま増える点は把握しておく。
- **知識ベースはコンテキストへの全文投入方式**：知識量が非常に多くなった場合
  （目安：数十万字を大きく超える場合）は、ベクトル検索（RAG）への切り替えを検討する。

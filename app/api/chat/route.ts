import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

const KNOWLEDGE_DIR = path.join(process.cwd(), "knowledge");

function loadKnowledge(): string {
  const files = fs
    .readdirSync(KNOWLEDGE_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();
  return files
    .map((f) => `## ファイル: ${f}\n\n${fs.readFileSync(path.join(KNOWLEDGE_DIR, f), "utf-8")}`)
    .join("\n\n---\n\n");
}

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "サーバー側にGEMINI_API_KEYが設定されていません" },
      { status: 500 }
    );
  }

  const { question } = await req.json().catch(() => ({ question: "" }));
  if (!question || typeof question !== "string" || !question.trim()) {
    return NextResponse.json({ error: "質問が空です" }, { status: 400 });
  }

  let knowledge: string;
  try {
    knowledge = loadKnowledge();
  } catch (err) {
    console.error("knowledge load error", err);
    return NextResponse.json(
      { error: "知識ベースの読み込みに失敗しました" },
      { status: 500 }
    );
  }

  const systemPrompt = `あなたは退職した社員「はたて」の分身として、他の社員からの質問に答えるアシスタントです。

# 振る舞いのルール
- 以下の「知識ベース」に書かれている内容だけを根拠に答えてください。知識ベースにない内容を推測で埋めないでください。
- 知識ベースに答えがない質問には、正直に「その情報は引き継ぎ資料には含まれていません」と伝えてください。
- 知識ベース内に文体・フォーマットのルールが書かれている場合は、それに従って回答してください。
- 断定できない・古い可能性がある情報には、その旨を一言添えてください。

# 知識ベース
${knowledge}`;

  let answer: string;
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `# 質問\n${question}` },
    ]);

    answer = result.response.text();
  } catch (err) {
    console.error("gemini error", err);
    return NextResponse.json(
      { error: "回答の生成に失敗しました。時間をおいて再度お試しください。" },
      { status: 500 }
    );
  }

  // 質問と回答の履歴をSupabaseに記録する。
  // ここが失敗しても、回答自体は利用者に返す（ログ保存の失敗でチャットを止めない）。
  const supabase = getSupabase();
  if (supabase) {
    const { error: logError } = await supabase
      .from("chat_logs")
      .insert({ question, answer });
    if (logError) {
      console.error("supabase insert error", logError);
    }
  } else {
    console.warn("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が未設定のため、履歴を保存していません");
  }

  return NextResponse.json({ answer });
}

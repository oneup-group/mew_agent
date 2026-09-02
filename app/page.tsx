"use client";

import { useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setError("");
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "エラーが発生しました");
      } else {
        setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]);
      }
    } catch {
      setError("通信に失敗しました。もう一度お試しください");
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <main
      style={{
        maxWidth: "680px",
        margin: "0 auto",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "0 16px",
      }}
    >
      <header style={{ padding: "24px 0 16px", borderBottom: "1px solid #e5e3dc", display: "flex", alignItems: "center", gap: "12px" }}>
        <img
          src="/appu-kun.jpg"
          alt="アップくん"
          style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
        />
        <div>
          <h1 style={{ fontSize: "18px", fontWeight: 500, margin: 0 }}>アップくんに聞く</h1>
          <p style={{ fontSize: "13px", color: "#777", margin: "4px 0 0" }}>
            業務の引き継ぎ内容について質問できます。回答は引き継ぎ資料の範囲に限られます。
          </p>
        </div>
      </header>

      <div style={{ flex: 1, padding: "16px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
        {messages.length === 0 && (
          <p style={{ fontSize: "14px", color: "#999", margin: "24px 0" }}>
            例：「ビアターの対象はなぜ北大生じゃないんですか？」のように聞いてみてください。
          </p>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              background: m.role === "user" ? "#2f6f5e" : "#f0efe9",
              color: m.role === "user" ? "#fff" : "#1a1a1a",
              padding: "10px 14px",
              borderRadius: "10px",
              fontSize: "14px",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
            }}
          >
            {m.text}
          </div>
        ))}

        {loading && (
          <div
            style={{
              alignSelf: "flex-start",
              fontSize: "13px",
              color: "#999",
              padding: "4px 2px",
            }}
          >
            考え中...
          </div>
        )}

        {error && (
          <div style={{ fontSize: "13px", color: "#c0392b", padding: "4px 2px" }}>
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        style={{
          display: "flex",
          gap: "8px",
          padding: "16px 0 24px",
          borderTop: "1px solid #e5e3dc",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="質問を入力"
          style={{
            flex: 1,
            padding: "10px 12px",
            fontSize: "14px",
            border: "1px solid #d4d4d0",
            borderRadius: "6px",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: "10px 18px",
            fontSize: "14px",
            fontWeight: 500,
            color: "#fff",
            background: loading || !input.trim() ? "#a9c4bc" : "#2f6f5e",
            border: "none",
            borderRadius: "6px",
            cursor: loading || !input.trim() ? "default" : "pointer",
          }}
        >
          送信
        </button>
      </form>
    </main>
  );
}

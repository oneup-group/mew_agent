import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "アップくんに聞く",
  description: "社内向け・引き継ぎ用の分身AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body
        style={{
          margin: 0,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Yu Gothic', sans-serif",
          background: "#fafaf8",
          color: "#1a1a1a",
        }}
      >
        {children}
      </body>
    </html>
  );
}

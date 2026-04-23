import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingSidebar from "@/components/FloatingSidebar";
import { getWeeklyMenu } from "@/lib/weekly";
import Script from "next/script";

export const metadata: Metadata = {
  title: {
    default: "前端下一步 · 帮前端在 AI 时代做对技术决策",
    template: "%s · 前端下一步",
  },
  description: "面向前端开发者的技术情报站：每日 AI / 前端情报、带观点的决策简报、从前端到 AI Agent 的转型路线图。加入 Pro 解锁完整判断、AI 问答与专属社群。",
  keywords: ["前端周刊", "AI Agent", "前端转型", "技术情报", "决策简报", "前端 AI", "MCP", "LLM"],
  openGraph: {
    title: "前端下一步 · 帮前端在 AI 时代做对技术决策",
    description: "每日情报 + 决策简报 + 转型路线——帮你在信息过载里，挑出真正值得投入的那 5%。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const menu = getWeeklyMenu();

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`font-sans min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`} suppressHydrationWarning>
        <Script src="//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js" strategy="afterInteractive" />
        <Header weeklyHref="/weekly" />
        <div className="flex flex-1">
          <main className="min-w-0 flex-1">
            {children}
          </main>
          <FloatingSidebar menu={menu} />
        </div>
        <Footer />
      </body>
    </html>
  );
}

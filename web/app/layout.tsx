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
  description: "面向前端开发者的 AI 雷达：过滤海外 AI 信号，沉淀 AI 转型路线和以人为主的个体决策案例。",
  keywords: ["前端周刊", "AI Agent", "前端转型", "技术情报", "决策简报", "前端 AI", "MCP", "LLM"],
  openGraph: {
    title: "前端下一步 · 帮前端在 AI 时代做对技术决策",
    description: "AI 雷达 + 转型路线 + 个体决策案例——帮你过滤噪声，把外部信号融进自己的路线。",
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

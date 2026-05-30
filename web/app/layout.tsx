import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingSidebar from "@/components/FloatingSidebar";
import { getWeeklyMenu } from "@/lib/weekly";
import Script from "next/script";
import { BRAND_SITE_URL } from "@/lib/site-matrix";

export const metadata: Metadata = {
  metadataBase: new URL(BRAND_SITE_URL),
  title: {
    default: "前端周看 · 站在前沿端点，每周看世界所发生的变化",
    template: "%s · 前端周看",
  },
  description: "每周为前端开发者精选并梳理 AI Coding、AI Agent、大模型与前端工程的关键动态——过滤噪声，只看真正该看的。",
  keywords: ["前端周报", "前端周刊", "AI Coding", "AI Agent", "前端 AI", "大模型", "前端工程", "MCP", "LLM"],
  openGraph: {
    title: "前端周看 · 站在前沿端点，每周看世界所发生的变化",
    description: "每周一份前端 × AI 的精选信息流：AI Coding、Agent、大模型与前端工程的关键变化，帮你用更少时间跟上节奏。",
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

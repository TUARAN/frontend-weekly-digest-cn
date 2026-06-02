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
    default: "前端周看 · 站在前沿端点，每周“胡乱”看看",
    template: "%s · 前端周看",
  },
  description: "关注前端、AI Coding、Agent 与工程实践的新变化。不制造焦虑，不传播焦虑，但不拒绝新潮观点。",
  keywords: ["前端周报", "前端周刊", "AI Coding", "AI Agent", "前端 AI", "大模型", "前端工程", "MCP", "LLM"],
  openGraph: {
    title: "前端周看 · 站在前沿端点，每周“胡乱”看看",
    description: "关注前端、AI Coding、Agent 与工程实践的新变化。不制造焦虑，不传播焦虑，但不拒绝新潮观点。",
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

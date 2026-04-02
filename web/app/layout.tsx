import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingSidebar from "@/components/FloatingSidebar";
import { getWeeklyMenu } from "@/lib/weekly";
import Script from "next/script";

export const metadata: Metadata = {
  title: "前端下一步 · 技术情报站",
  description: "以前端、AI Agent、大模型与面试体系为核心，用结构化数据与 AI Agent 持续追踪技术信号，输出可检索、可理解、可复用的技术情报。",
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

import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingSidebar from "@/components/FloatingSidebar";
import { getWeeklyMenu } from "@/lib/weekly";
import Script from "next/script";

export const metadata: Metadata = {
  title: "前端周刊 - 紧跟全球前端技术动态",
  description: "每周更新国外论坛的前端热门文章，推荐大家阅读/翻译，紧跟时事，掌握前端技术动态。",
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
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <FloatingSidebar menu={menu} />
        <Footer />
      </body>
    </html>
  );
}

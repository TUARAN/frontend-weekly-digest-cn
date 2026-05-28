import {
  FileText,
  Languages,
  Zap,
  BookOpen,
} from 'lucide-react';
import AiDailyBoard from '@/components/AiDailyBoard';
import PageCarousel from '@/components/PageCarousel';
import type { PageDefinition } from '@/components/PageCarousel';

export const metadata = {
  title: 'AI 雷达',
  description: '从 AI 噪声中筛出前端能用的判断：每日早报、短文速递、精译长文、深度解读。',
};

export default function AiRadarHome() {
  const pages: PageDefinition[] = [
    /* ── Page 1 · AI 早报 ── */
    {
      key: 'daily',
      label: 'AI 早报',
      icon: <Zap className="h-4 w-4" />,
      content: <AiDailyBoard />,
    },

    /* ── Page 2 · 短文 ── */
    {
      key: 'brief',
      label: '短文',
      icon: <FileText className="h-4 w-4" />,
      content: (
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600 dark:text-orange-400">
            每日速递
          </p>
          <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
            短文速递 · 24h 快讯
          </h2>
          <p className="mt-3 max-w-xl text-base leading-7 text-gray-500 dark:text-gray-400">
            300-500 字，每日 1-3 条。24 小时内把关键信号转成中文判断，适合快速浏览和转发。
          </p>
        </div>
      ),
    },

    /* ── Page 3 · 中文 ── */
    {
      key: 'digest',
      label: '中文',
      icon: <Languages className="h-4 w-4" />,
      content: (
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">
            每周精译
          </p>
          <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
            中文精译 · 优质长文翻译
          </h2>
          <p className="mt-3 max-w-xl text-base leading-7 text-gray-500 dark:text-gray-400">
            1500-3000 字，每周 2-3 篇。保留原文价值，重写标题、结构和中文表达，读起来像中文作者写的。
          </p>
        </div>
      ),
    },

    /* ── Page 4 · 长文 ── */
    {
      key: 'deep',
      label: '长文',
      icon: <BookOpen className="h-4 w-4" />,
      content: (
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
            月度深读
          </p>
          <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
            长文深读 · 论文级解读
          </h2>
          <p className="mt-3 max-w-xl text-base leading-7 text-gray-500 dark:text-gray-400">
            5000+ 字，每月 1-2 篇。补足背景、画出技术关系图，给前端和 AI 开发者明确行动建议。
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-4xl">
              从 AI 噪声中
              <span className="text-blue-600 dark:text-blue-400"> 筛出前端能用的判断</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
              不做信息搬运，只做信号筛选。每条内容都帮你回答一个问题：这对前端意味着什么？
            </p>
          </div>
        </div>

        <PageCarousel pages={pages} />
      </div>
    </div>
  );
}

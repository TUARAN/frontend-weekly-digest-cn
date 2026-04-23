import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import BriefCard from '@/components/BriefCard';
import { getAllBriefs } from '@/lib/briefs';

export const metadata = {
  title: '决策简报 · 前端下一步',
  description: '不只是告诉你发生了什么，而是告诉你该不该上、怎么上。带观点的前端 / AI Agent 技术决策简报。',
};

export default function BriefIndexPage() {
  const briefs = getAllBriefs();

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Decision Brief</p>
            <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">决策简报</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-gray-500 dark:text-gray-400">
              每篇只围绕一个具体决策：事实 / 反方观点 / 作者判断 / 然后你该做什么。
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-500">
              我们不追最新、不凑数量。宁可一周只出一篇，也不发那种读完"又多知道一件事"但不会改变你任何行为的东西。
            </p>
          </div>
          <Link
            href="/pro"
            className="inline-flex items-center gap-1.5 self-start rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:border-gray-400 dark:border-gray-700 dark:text-gray-100"
          >
            <Sparkles className="h-4 w-4" />
            想聊聊自己的决策？
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {briefs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-400">
            简报正在准备中，敬请期待。
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {briefs.map((brief) => (
              <BriefCard key={brief.slug} brief={brief} />
            ))}
          </div>
        )}

        <div className="mt-16 rounded-3xl border border-gray-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8 dark:border-gray-800 dark:from-blue-950/40 dark:via-gray-950 dark:to-indigo-950/40 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">想拆解一个属于你自己的决策？</h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-gray-600 dark:text-gray-300">
            通用简报给你思考框架，但真正有效的判断一定是和你的阶段、项目、业务绑定的。公开简报只是原料，真正值钱的是 1v1 把它融进你自己的成长体系。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/pro"
              className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              看看 1v1 怎么聊
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:border-gray-400 dark:border-gray-700 dark:text-gray-100"
            >
              查看转型路线
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

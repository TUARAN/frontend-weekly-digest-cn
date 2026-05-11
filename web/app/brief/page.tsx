import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import BriefCard from '@/components/BriefCard';
import { getAllBriefs } from '@/lib/briefs';

export const metadata = {
  title: '决策简报 · 前端下一步',
  description: '以真实个体为主线的决策案例：一个人在某个阶段如何判断、取舍、试错，并把 AI 与前端能力融进自己的路线。',
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
              这里不再做资讯复述，而是写人的决策案例：一个前端开发者、独立创作者或团队负责人，在具体阶段里如何判断方向、分配时间、选择工具、承担风险。
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-500">
              每篇都围绕一个人和一个选择展开：背景是什么、纠结点在哪里、做过哪些尝试、最后如何把外部信号融入自己的成长体系和项目节奏。
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
            公开案例给你参考样本，但真正有效的判断一定要回到你自己的阶段、约束、项目和生活节奏。1v1 会把案例里的方法拆回到你本人身上。
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

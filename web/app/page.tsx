import Image from 'next/image';
import { BrainCircuit, Radar, Sparkles } from 'lucide-react';
import Link from 'next/link';
import LiveSignalBoard from '@/components/LiveSignalBoard';

const focusAreas = [
  {
    title: '前端技术演进',
    description: '持续跟踪框架、浏览器 API、构建工具、性能与交互范式的真实变化。',
    icon: Radar,
    ctaLabel: '前端周刊',
    ctaHref: '/weekly',
  },
  {
    title: 'AI Agent 与大模型',
    description: '观察模型能力、Agent 基础设施、MCP、工作流与产品落地的有效信号。',
    icon: BrainCircuit,
    ctaLabel: '学习资料库',
    ctaHref: 'https://matrix-ai-pdfs.pages.dev/',
  },
  {
    title: '面试与能力体系',
    description: '把高频技术问题、趋势议题与知识图谱打通，形成可复用的判断框架。',
    icon: Sparkles,
    ctaLabel: '转型面试',
    ctaHref: 'https://frontend2aiagent.com/',
  },
];

const principles = [
  'AI Agent 用来放大效率，不替代判断。',
  '结构化沉淀优先于一次性输出。',
  '人工 Review 仍然是最终质量门槛。',
  '目标不是提供更多内容，而是提供更高密度的信号。',
];

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:py-12">
      <section className="mb-16 flex flex-col items-center text-center">
        <h1 className="mx-auto max-w-5xl text-4xl font-bold tracking-tight text-gray-900 dark:text-white md:text-6xl">
          从信息搬运，转向技术判断
        </h1>

        <p className="mx-auto mt-6 max-w-4xl text-lg leading-8 text-gray-600 dark:text-gray-300 md:text-2xl md:leading-10">
          本站不再只整理“前端周刊”，而是持续追踪前端、AI Agent、大模型，以及前端转向 AI Agent 开发所需的面试与能力体系。
        </p>

        <p className="mx-auto mt-4 max-w-4xl text-base leading-7 text-gray-500 dark:text-gray-400 md:text-lg">
          帮助前端开发者快速看清趋势、做出技术决策，并找到真正值得投入的方向。
        </p>

      </section>

      <section className="mx-auto mb-16 grid max-w-6xl gap-6 md:grid-cols-3">
        {focusAreas.map(({ title, description, icon: Icon, ctaLabel, ctaHref }) => (
          <div
            key={title}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="mb-4 inline-flex rounded-xl bg-blue-50 p-3 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">{description}</p>
            {ctaLabel && ctaHref ? (
              <Link
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 transition hover:border-gray-400 dark:border-gray-700 dark:text-gray-100"
              >
                {ctaLabel}
              </Link>
            ) : null}
          </div>
        ))}
      </section>

      <LiveSignalBoard />

      <section className="mx-auto mb-16 grid max-w-6xl gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Why Now</p>
          <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">为什么从周刊走向情报站</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-gray-600 dark:text-gray-400 md:text-base">
            <p>大模型正在重塑软件开发的分工边界。过去前端的核心价值在于把设计稿变成可交互的界面；而现在，越来越多的交互逻辑、流程编排、甚至用户意图的理解，都在被 AI 接管。</p>
            <p>前端如果只会写组件，正在失去不可替代性。</p>
            <p>真正的机会在于向上转型——成为能够设计、构建、调试 AI Agent 的开发者。这不是追风口，而是顺应一个基本事实：当 AI 成为产品的核心交互层，懂得驾驭 AI 能力的工程师，才是下一代应用真正需要的人。</p>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Principles</p>
          <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">AI情报站的工作原则</h2>
          <div className="mt-5 space-y-4">
            {principles.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="fixed bottom-4 left-4 z-50">
        <div className="breathing overflow-hidden rounded-xl bg-white/90 ring-1 ring-gray-900/10 backdrop-blur dark:bg-gray-900/80 dark:ring-white/10">
          <Image
            src="/qrcode1.png"
            alt="扫码加群"
            width={140}
            height={140}
            className="h-auto w-[140px]"
            priority={false}
            loading="lazy"
          />
          <div className="px-2 py-1 text-center text-sm font-medium text-gray-900 dark:text-gray-100">
            扫码加入讨论
          </div>
        </div>
      </div>
    </div>
  );
}

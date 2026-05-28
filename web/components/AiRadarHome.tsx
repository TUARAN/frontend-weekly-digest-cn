import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ExternalLink,
  FileText,
  Gauge,
  GitBranch,
  Languages,
  Radio,
  Sparkles,
} from 'lucide-react';
import {
  contentTiers,
  differentiators,
  promptGuidelines,
  roadmapLevels,
  signalSources,
  workflowSteps,
} from '@/lib/ai-radar';

export const metadata = {
  title: 'AI 雷达',
  description: '海外 AI 前沿速译栏目：每日速递、每周精译、每月深读，把一手信号翻成前端开发者能用的判断。',
};

const sampleItems = [
  {
    type: '速递',
    title: 'OpenAI 发布新模型能力更新，前端产品要重新评估流式交互',
    source: 'OpenAI Blog',
    time: '今日待译',
  },
  {
    type: '精译',
    title: '从 Agent Loop 到工具调用：为什么前端正在变成 AI 产品编排层',
    source: 'Latent Space',
    time: '本周选题',
  },
  {
    type: '深读',
    title: '浏览器里的本地模型：成本、延迟与隐私边界的重新分配',
    source: 'arXiv / Papers With Code',
    time: '月度主题',
  },
];

export default function AiRadarHome() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="mx-auto max-w-6xl">

        {/* ── AI 早报板块 ── */}
        <section className="mb-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">AI Daily · 今日早报</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">每日 AI 早报</h2>
              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">精选 AI Coding &amp; 具身智能最新动态，每日 09:00 自动更新</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
              今日已更新
            </span>
          </div>
          <div className="flex justify-center rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
            <iframe
              src="/ai-daily-0528.html"
              title="AI 早报 2026-05-28"
              className="rounded-2xl"
              style={{ width: '500px', height: '820px', border: 'none' }}
              scrolling="no"
            />
          </div>
        </section>
        {/* ── /AI 早报板块 ── */}

        <section className="mb-14 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
              <Radio className="h-3.5 w-3.5" />
              AI Radar · 海外前沿速译
            </div>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-6xl">
              把海外 AI 信号翻成前端能用的判断
            </h1>
            <div className="mt-6 max-w-3xl border-l-4 border-blue-600 bg-blue-50 px-5 py-4 dark:border-blue-400 dark:bg-blue-950/30">
              <p className="text-xl font-bold leading-8 text-gray-900 dark:text-white md:text-2xl md:leading-10">
                99% 的 AI 资讯只是噪声。
              </p>
              <p className="mt-2 text-base leading-8 text-gray-700 dark:text-gray-200 md:text-lg">
                AI 雷达不追更多信息，也不凑热点，而是筛出真正值得停下来的海外信号，把它翻译、压缩、重写成能融进你自身成长体系、项目判断和前端工程实践的内容。
              </p>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500 dark:text-gray-400 md:text-base">
              每篇都补上本土化解读：这件事对前端工程、AI Agent 产品和个人能力意味着什么，以及你接下来该不该关注、怎么验证、如何纳入自己的技术路线。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#workflow"
                className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              >
                查看生产流水线
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/brief"
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:border-gray-400 dark:border-gray-700 dark:text-gray-100"
              >
                看个体决策案例
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Queue</p>
                <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">待处理选题</h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                半自动
              </span>
            </div>
            <div className="space-y-3">
              {sampleItems.map((item) => (
                <article key={item.title} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-gray-200 dark:bg-gray-950 dark:text-blue-300 dark:ring-gray-800">
                      {item.type}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{item.time}</span>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold leading-6 text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="mt-2 inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <ExternalLink className="h-3.5 w-3.5" />
                    {item.source}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Content System</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">三档内容结构</h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {contentTiers.map((tier) => (
              <article key={tier.name} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                <div className="mb-4 inline-flex rounded-xl bg-blue-50 p-2.5 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{tier.name}</h3>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500 dark:text-gray-400">篇幅</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{tier.length}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500 dark:text-gray-400">频率</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{tier.cadence}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">适合内容</dt>
                    <dd className="mt-1 leading-6 text-gray-700 dark:text-gray-300">{tier.fit}</dd>
                  </div>
                </dl>
                <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-400">{tier.intent}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-14 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Sources</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">信号源优先级</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
              先抓一手信号，再用社区热度做验证，最后用国内媒体对照去重，避免重复劳动。
            </p>
            <div className="mt-5 space-y-3">
              {signalSources.map((source) => (
                <div key={source.level} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{source.level}</h3>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-600 ring-1 ring-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:ring-gray-800">
                      {source.priority}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">{source.sources}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="workflow" className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Workflow</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">半自动翻译生产流水线</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {workflowSteps.map((step, index) => (
                <article key={step.title} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white dark:bg-white dark:text-gray-900">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">{step.title}</h3>
                      <p className="text-xs text-blue-600 dark:text-blue-400">{step.owner}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">{step.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-14 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="mb-4 inline-flex rounded-xl bg-violet-50 p-2.5 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
              <Languages className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Claude 翻译 Prompt 资产</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
              Prompt 是这个栏目的核心资产，先版本化沉淀规则，再接 API 和待审队列。
            </p>
            <ul className="mt-5 space-y-3">
              {promptGuidelines.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="mb-4 inline-flex rounded-xl bg-amber-50 p-2.5 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              <Gauge className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">差异化策略</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
              不和机器之心、量子位拼覆盖面，栏目重点放在前端开发者视角、HTML 可视化和快讯速度。
            </p>
            <ul className="mt-5 space-y-3">
              {differentiators.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
                  <Sparkles className="mt-1 h-4 w-4 shrink-0 text-amber-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mb-14">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Build Plan</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">与 Next.js 项目集成路线</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {roadmapLevels.map((level) => (
              <article key={level.name} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-gray-900">
                    {level.name}
                  </span>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{level.duration}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">{level.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">{level.scope}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8 dark:border-gray-800 dark:from-blue-950/40 dark:via-gray-950 dark:to-indigo-950/40 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
                <GitBranch className="h-4 w-4" />
                当前已落地 Level 1 信息架构
              </div>
              <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">下一步可以接 MDX 内容和翻译工作台</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300">
                先让栏目对外可见，再把现有抓取翻译工具迁到统一工作流里，逐步接入 Claude API、待审队列和订阅分发。
              </p>
            </div>
            <Link
              href="/tool"
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              打开翻译工具
              <Bot className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

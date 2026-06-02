import Link from 'next/link';
import { ArrowRight, CalendarDays, Map, Sparkles } from 'lucide-react';
import AiDailyBoard from '@/components/AiDailyBoard';
import LiveSignalBoard from '@/components/LiveSignalBoard';
import { getAllWeeklies } from '@/lib/weekly';
import { getAiHotFeed } from '@/lib/ai-hot-feed';
import { getDailyManifest, getLatestDaily } from '@/lib/ai-daily';
import { buildWeeklyUrl } from '@/lib/site-matrix';

export const metadata = {
  description:
    '关注前端、AI Coding、Agent 与工程实践的新变化。不制造焦虑，不传播焦虑，但不拒绝新潮观点。',
};

function extractWeeklySnippet(content: string, maxLen = 120): string {
  const lines = content.split('\n');
  let afterRecommend = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (/推荐语/.test(line)) {
      afterRecommend = true;
      continue;
    }
    if (!afterRecommend) continue;
    if (/^(>|#|---|!\[|\|)/.test(line)) continue;
    if (/^[-*+]\s/.test(line)) continue;
    const text = line
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .trim();
    if (text.length < 24) continue;
    return text.length > maxLen ? text.slice(0, maxLen - 2) + '…' : text;
  }
  return '';
}

export default function AiRadarHome() {
  const weeklies = getAllWeeklies();
  const [featured, ...rest] = weeklies;
  const recent = rest.slice(0, 3).map((w) => ({ ...w, snippet: extractWeeklySnippet(w.content, 64) }));
  const featuredSnippet = featured ? extractWeeklySnippet(featured.content) : '';
  const feed = getAiHotFeed();
  const dailyManifest = getDailyManifest();
  const latestDaily = getLatestDaily();

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-6xl">
        {/* ── Hero ── */}
        <header className="mb-8 md:mb-10">
          <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-3xl md:text-4xl">
            站在前沿端点，
            <span className="text-blue-600 dark:text-blue-400">每周“胡乱”看看</span>
          </h1>
          <p className="mt-3 max-w-2xl text-[13px] leading-6 text-gray-500 dark:text-gray-400 md:text-sm">
            这里关注前端、AI Coding、Agent、大模型与工程实践。不是信息轰炸，不制造焦虑，也不传播焦虑；只是把值得停下来看的变化筛一筛、想一想、讲清楚。
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {featured && (
              <a
                href={buildWeeklyUrl(`/weekly/${featured.slug}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 hover:gap-2 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              >
                阅读本周周刊
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            )}
            <Link
              href="/pro"
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:gap-2 dark:border-gray-700 dark:text-gray-200 dark:hover:border-gray-500"
            >
              <Sparkles className="h-3.5 w-3.5" />
              加入会员 / 1v1
            </Link>
          </div>
        </header>

        {/* ── 1. 周刊（差异化核心资产） ── */}
        {featured && (
          <section id="weekly" className="scroll-mt-32 md:scroll-mt-20">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 md:text-sm">
                  本周周刊
                </p>
                <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl md:text-3xl">
                  前端周刊 · 每周一份精选
                </h2>
              </div>
              <a
                href={buildWeeklyUrl('/weekly')}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden shrink-0 items-center gap-1 text-sm font-medium text-blue-600 transition hover:gap-2 dark:text-blue-400 sm:flex"
              >
                查看全部 {weeklies.length} 期
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <a
              href={buildWeeklyUrl(`/weekly/${featured.slug}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="group block overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm transition hover:shadow-md dark:border-blue-900/40 dark:from-blue-950/30 dark:to-gray-950 md:p-8"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-400/10 dark:text-blue-300">
                <CalendarDays className="h-3.5 w-3.5" />
                最新一期
              </span>
              <h3 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                {featured.title}
              </h3>
              {featured.date && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{featured.date}</p>
              )}
              {featuredSnippet && (
                <p className="mt-4 line-clamp-3 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {featuredSnippet}
                </p>
              )}
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition group-hover:gap-2 dark:text-blue-400">
                阅读本期
                <ArrowRight className="h-4 w-4" />
              </span>
            </a>

            {recent.length > 0 && (
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {recent.map((w) => (
                  <a
                    key={w.slug}
                    href={buildWeeklyUrl(`/weekly/${w.slug}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700"
                  >
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {w.title}
                      </h3>
                      {w.date && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{w.date}</p>
                      )}
                      {w.snippet && (
                        <p className="mt-3 line-clamp-3 text-xs leading-5 text-gray-600 dark:text-gray-400">
                          {w.snippet}
                        </p>
                      )}
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-blue-600 transition group-hover:gap-2 dark:text-blue-400">
                      阅读
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </a>
                ))}
              </div>
            )}

            <a
              href={buildWeeklyUrl('/weekly')}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:gap-2 dark:text-blue-400 sm:hidden"
            >
              查看全部 {weeklies.length} 期
              <ArrowRight className="h-4 w-4" />
            </a>
          </section>
        )}

        {/* ── 2. 每日精选 ── */}
        <section id="daily" className="mt-10 scroll-mt-32 md:mt-16 md:scroll-mt-20">
          <AiDailyBoard manifest={dailyManifest.list} initial={latestDaily} />
        </section>

        {/* ── 3. 7×24 实时资讯 ── */}
        <section id="live" className="mt-10 scroll-mt-32 md:mt-16 md:scroll-mt-20">
          <LiveSignalBoard items={feed.items} updatedAt={feed.updatedAt} />
        </section>

        {/* ── 4. 转型路线 + 加入引导 ── */}
        <section className="mt-10 grid gap-4 md:mt-16 md:grid-cols-2">
          <Link
            href="/roadmap"
            className="group flex flex-col gap-4 rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 shadow-sm transition hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:from-gray-900 dark:to-gray-950 md:p-7"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
              <Map className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                Roadmap
              </p>
              <h3 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                前端 → AI Agent 转型路线图
              </h3>
              <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                一张为 3-5 年前端打造的能力地图，把&ldquo;写组件&rdquo;到&ldquo;构建 Agent&rdquo;拆成可执行阶段。
              </p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition group-hover:gap-2 dark:text-blue-400">
              查看路线图
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>

          <Link
            href="/pro"
            className="group flex flex-col gap-4 rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-blue-900/40 dark:from-blue-950/30 dark:via-gray-950 dark:to-gray-950 md:p-7"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
              <Sparkles className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                Membership
              </p>
              <h3 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                不是又一个付费订阅
              </h3>
              <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                入会拿到筛掉噪音后的判断；1v1 聊你的阶段、项目、正在纠结的那一件事。
              </p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition group-hover:gap-2 dark:text-blue-400">
              查看会员方案
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </section>
      </div>
    </div>
  );
}

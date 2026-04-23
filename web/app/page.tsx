import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ArrowRight, Bot, Map, ScrollText, MessageCircle, VolumeX } from 'lucide-react';
import LiveSignalBoard from '@/components/LiveSignalBoard';
import BriefCard from '@/components/BriefCard';
import NewsletterSignup from '@/components/NewsletterSignup';
import { getAllBriefs } from '@/lib/briefs';

const pillars = [
  {
    icon: ScrollText,
    title: '决策简报',
    desc: '每篇围绕一个决策：该不该上、怎么上、别人踩过的坑。',
    href: '/brief',
  },
  {
    icon: Map,
    title: '转型路线',
    desc: '前端 → AI Agent 的能力地图，分阶段，不贪多。',
    href: '/roadmap',
  },
  {
    icon: MessageCircle,
    title: '1v1 定制化',
    desc: '聊你的阶段和困惑，把判断真正融进你的项目。',
    href: '/pro',
  },
];

const principles = [
  '不追"最新"，只挑"值得停下来"的那 1%。',
  '不制造焦虑，不贩卖恐慌。',
  '每一条信号都要能回答"然后我该做什么"。',
  '如果一条信息不能融进你的体系，它就是噪音。',
];

export default function Home() {
  const briefs = getAllBriefs().slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:py-14">
      {/* Hero — 反噪音立场（全站只在这里完整表达一次） */}
      <section className="mb-24 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
          <VolumeX className="h-3 w-3" />
          为前端开发者筛选 · 反信息焦虑
        </div>
        <h1 className="mx-auto mt-5 max-w-5xl text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-6xl">
          99% 的前端资讯是<span className="text-gray-400 line-through decoration-red-400 decoration-[3px]">噪音</span><br className="hidden md:block" />
          你要的是能<span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">融进成长体系</span>的那 1%
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600 dark:text-gray-300 md:text-xl">
          信息差大多是焦虑的源头，不是成长的燃料。这里不追最新、不凑数，只做当周真正值得停下来的 1-2 个判断。
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/brief"
            className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            看本周决策简报
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/pro"
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-900 transition hover:border-gray-400 dark:border-gray-700 dark:text-gray-100"
          >
            <MessageCircle className="h-4 w-4" />
            1v1 定制化交流
          </Link>
        </div>
      </section>

      {/* 三个产品入口 */}
      <section className="mx-auto mb-20 max-w-6xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">What You Get</p>
          <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">这里不是"更多信息"，是三件具体的事</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, desc, href }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-950"
            >
              <div className="mb-3 inline-flex rounded-xl bg-blue-50 p-2.5 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">{desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition group-hover:gap-1.5 dark:text-blue-400">
                了解详情
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 本周简报 */}
      {briefs.length > 0 ? (
        <section className="mx-auto mb-20 max-w-6xl">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Decision Brief</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">本周值得停下来的决策</h2>
            </div>
            <Link
              href="/brief"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              查看全部
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {briefs.map((b) => (
              <BriefCard key={b.slug} brief={b} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Newsletter */}
      <section className="mx-auto mb-20 max-w-4xl rounded-3xl border border-gray-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8 dark:border-gray-800 dark:from-blue-950/40 dark:via-gray-950 dark:to-indigo-950/40 md:p-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">每周一封，少即是多</h2>
          <p className="mt-3 text-base leading-7 text-gray-600 dark:text-gray-300">
            不转发、不凑数。周一早上一封邮件，告诉你这周哪 1-2 件事值得认真想一想。
          </p>
          <div className="mt-6">
            <NewsletterSignup />
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">一键退订，绝不发广告。</p>
        </div>
      </section>

      {/* Raw signals — 原料，不鼓励刷 */}
      <LiveSignalBoard />

      {/* Principles */}
      <section className="mx-auto mb-16 max-w-5xl">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950 md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Principles</p>
          <h2 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">工作原则</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {principles.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
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

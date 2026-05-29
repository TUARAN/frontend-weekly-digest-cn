'use client';

import { useMemo, useState } from 'react';
import { Copy, ExternalLink } from 'lucide-react';

interface SignalItem {
  topic: string;
  title: string;
  summary: string;
  source: string;
  href: string;
  time: string;
}

const signals: SignalItem[] = [
  {
    topic: 'AI Coding',
    title: 'Claude Opus 4.8 正式发布：动态工作流 + 可调思考强度',
    summary: '距 Opus 4.7 仅 41 天，Anthropic 推出 Opus 4.8，新增"动态工作流"一次性调度数百个子 Agent，支持用户可控"思考投入"机制，快速模式推理速度提升 2.5 倍且价格降低 3 倍。Claude Code 编程可靠性大幅提升。',
    source: 'Anthropic / IT之家 / 腾讯新闻',
    href: 'https://www.ithome.com/0/956/827.htm',
    time: '今日',
  },
  {
    topic: 'AI Coding',
    title: 'OpenClaw 引爆"百虾大战"，三部门联合出台智能体实施意见',
    summary: '开源框架 OpenClaw（315K Star）引发百度、阿里、腾讯、字节、智谱等巨头密集入局。国家网信办、发改委、工信部联合印发《智能体规范应用与创新发展实施意见》，AI Agent 从技术狂飙进入政策规范期。',
    source: '新华网 / 搜狐 / 腾讯新闻',
    href: 'https://news.qq.com/rain/a/20260526A04ZAC00',
    time: '今日',
  },
  {
    topic: '具身智能',
    title: 'Figure 03 完成 200 小时连续作业，分拣近 25 万包裹零故障',
    summary: '3 台 Figure 03 机器人轮班作业 200 小时，累计分拣 249,556 件包裹，全程零硬件故障、零人工干预。Figure AI 估值达 390 亿美元，这是人形机器人从演示验证迈向工业商用的关键里程碑。',
    source: 'IT之家 / 虎嗅 / 新浪科技',
    href: 'https://finance.sina.com.cn/tech/digi/2026-05-25/doc-inhzcpie3422228.shtml',
    time: '今日',
  },
  {
    topic: '具身智能',
    title: '宇树科技 6 月 1 日 IPO 上会，A 股"朋友圈"集体躁动',
    summary: '受理到上会仅 73 天，拟融资 42.02 亿元，2025 年营收 16.99 亿元、预计上半年净利超 2.58 亿元。上会前 A 股具身智能概念股已异动，券商密集覆盖研报，有望成 A 股"具身智能第一股"。',
    source: '证券时报 / 上交所 / 中国工业新闻网',
    href: 'https://www.cs.com.cn/ssgs/01/2026/05/27/detail_2026052710014380.html',
    time: '今日',
  },
  {
    topic: '具身智能',
    title: '世界智博会天津持续进行，具身智能首次独立成馆',
    summary: '2026 世界智能产业博览会展览面积 13 万㎡，超 700 家企业参展。具身智能首次独立成馆，宇树、京东等头部企业集体亮相，发布 200 余项新标准、新产品与新技术。',
    source: 'IT之家 / 新华网 / 光明网',
    href: 'https://www.ithome.com/0/956/495.htm',
    time: '今日',
  },
];

function SignalCard({ item }: { item: SignalItem }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = `${item.topic}\n${item.title}\n${item.summary}\n原文：${item.href}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-950/85">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
              {item.topic}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{item.time}</span>
          </div>
          <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">{item.title}</h3>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">{item.summary}</p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="truncate text-xs text-gray-500 dark:text-gray-400">{item.source}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-gray-400 dark:border-gray-700 dark:text-gray-200"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? '已复制' : '复制转发'}
          </button>
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            查看出处
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}

function SignalStream({ items }: { items: SignalItem[] }) {
  const loopItems = useMemo(() => [...items, ...items], [items]);

  return (
    <div className="signal-marquee relative h-[640px] overflow-hidden">
      <div className="signal-track">
        {loopItems.map((item, index) => (
          <div key={`${item.title}-${index}`} className="mb-4">
            <SignalCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LiveSignalBoard() {
  return (
    <section className="mx-auto mb-16 max-w-6xl rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 shadow-sm dark:border-gray-800 dark:from-gray-950 dark:to-gray-900">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">7×24h Feed</p>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">AI、Agent、前端、科技 实时播报</h2>
      </div>

      <SignalStream items={signals} />
    </section>
  );
}

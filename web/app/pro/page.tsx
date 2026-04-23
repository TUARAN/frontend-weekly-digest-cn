import Link from 'next/link';
import { Check, Filter, MessageCircle, Target } from 'lucide-react';

export const metadata = {
  title: '1v1 定制化交流 · 前端下一步',
  description: '不是又一个付费订阅。是一个人帮你把判断真正融进你自己的阶段和项目里。',
};

const noise = [
  {
    icon: Filter,
    title: '不是信息搬运',
    body: '不会靠高频更新制造存在感。重点是筛掉噪音，而不是把更多链接塞给你。',
  },
  {
    icon: Target,
    title: '不是通用清单',
    body: '不会给每个人一套一样的“学习路线”。重点是结合你的阶段和项目做判断。',
  },
  {
    icon: MessageCircle,
    title: '不是群聊答疑',
    body: '不是在公共群里随手回两句。1v1 的价值在于上下文完整、建议可执行。',
  },
];

const tiers = [
  {
    name: '免费阅读',
    price: '¥0',
    period: '永久',
    description: '适合刚开始关注趋势、还在观望的前端',
    features: [
      '公开的每日原始信号流',
      '每周 1-2 篇免费决策简报',
      '转型路线图的基础阶段',
      '前端周刊翻译全量',
    ],
    cta: '开始免费阅读',
    ctaHref: '/brief',
    highlight: false,
  },
  {
    name: '入会 · 过滤器',
    subtitle: '帮你屏蔽 99% 的噪音',
    price: '¥299',
    period: '一年',
    description: '适合想少刷资讯、只看筛选结果的在职前端',
    features: [
      '全部历史 + 未来决策简报',
      '转型路线图完整版（5 阶段）',
      '每月一次"本月只有这 3 件事值得注意"会员信',
      '不再在公开页出现的深度拆解（避免喂算法）',
      '专属读者微信群',
    ],
    cta: '加入过滤器',
    ctaHref: '/order?plan=yearly',
    highlight: false,
  },
  {
    name: '1v1 定制化',
    subtitle: '把想法融进你的成长体系',
    price: '¥1,499',
    period: '起 · 含 3 次 1 小时连麦',
    description: '适合在具体阶段卡住、想要"有一个人帮你想"的前端',
    features: [
      '入会一年全部权益',
      '3 次 1 小时 1v1 连麦（半年内用完）',
      '会前：你的阶段 / 项目 / 困惑问卷',
      '会中：针对你的情况给判断，不给清单',
      '会后：一页"你的下一步"纪要，可执行',
      '群内优先答疑',
    ],
    cta: '预约 1v1',
    ctaHref: '/order?plan=1v1',
    highlight: true,
  },
];

const howItWorks = [
  {
    step: '01',
    title: '你先填问卷',
    body: '说清你现在的岗位、项目、团队、最近在纠结的 1-2 件事。真实、具体，越具体越值钱。',
  },
  {
    step: '02',
    title: '我先读完再见你',
    body: '连麦前我会把你的背景、当前在看的技术栈、你在纠结的决策都过一遍，不浪费你的 1 小时。',
  },
  {
    step: '03',
    title: '连麦 1 小时',
    body: '不讲通用道理。只聊"以你现在的情况，这件事该不该做、怎么做、可能踩的坑"。',
  },
  {
    step: '04',
    title: '一页纪要',
    body: '结束后把讨论总结成一页纸，包含 3-5 个你下周就能动手的具体动作。放你的文档里，不发群。',
  },
];

export default function ProPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
            <MessageCircle className="h-3 w-3" />
            1v1 定制化交流
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-6xl">
            不是付费订阅，<br className="hidden md:block" />
            是&ldquo;有一个人帮你想&rdquo;
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-gray-600 dark:text-gray-300 md:text-xl">
            两种方式：入会拿到筛掉噪音后的判断；1v1 聊你的阶段、项目、正在纠结的那一件事。
          </p>
        </div>

        {/* Pro 不是什么 */}
        <div className="mb-16 grid gap-5 md:grid-cols-3">
          {noise.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="inline-flex rounded-xl bg-white p-2 text-gray-700 dark:bg-gray-950 dark:text-gray-300">
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="mt-3 text-base font-bold text-gray-900 dark:text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">{body}</p>
            </div>
          ))}
        </div>

        {/* Tiers */}
        <div className="grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-3xl border p-8 shadow-sm ${
                tier.highlight
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 via-white to-indigo-50 ring-2 ring-blue-500 dark:border-blue-400 dark:from-blue-950/40 dark:via-gray-950 dark:to-indigo-950/40 dark:ring-blue-400'
                  : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950'
              }`}
            >
              {tier.highlight ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow">
                  作者推荐
                </div>
              ) : null}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{tier.name}</h3>
              {tier.subtitle ? (
                <p className="mt-1 text-xs font-medium text-blue-600 dark:text-blue-400">{tier.subtitle}</p>
              ) : null}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  {tier.price}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{tier.period}</span>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{tier.description}</p>

              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.ctaHref}
                className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  tier.highlight
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow hover:from-blue-500 hover:to-indigo-500'
                    : 'border border-gray-300 text-gray-900 hover:border-gray-400 dark:border-gray-700 dark:text-gray-100'
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-20">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">How 1v1 Works</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">1v1 不是直播答疑，是认真准备的一对一</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((s) => (
              <div key={s.step} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
                <div className="text-xs font-bold tracking-widest text-blue-600 dark:text-blue-400">{s.step}</div>
                <h3 className="mt-2 text-base font-bold text-gray-900 dark:text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 适合 / 不适合 */}
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-8 dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">适合来聊</h3>
            <ul className="mt-4 space-y-2.5 text-sm leading-6 text-emerald-900/80 dark:text-emerald-200/80">
              <li>· 3-5 年前端，想判断自己要不要转 AI Agent</li>
              <li>· 想在当前业务里落地一个 Agent，但不知道从哪切</li>
              <li>· 新框架新范式太多，已经刷累了</li>
              <li>· 想要一个&ldquo;见过你情况&rdquo;的人给具体建议</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-red-200 bg-red-50/50 p-8 dark:border-red-900/50 dark:bg-red-950/20">
            <h3 className="text-lg font-bold text-red-900 dark:text-red-200">不适合</h3>
            <ul className="mt-4 space-y-2.5 text-sm leading-6 text-red-900/80 dark:text-red-200/80">
              <li>· 想要&ldquo;一份应该学的清单&rdquo;的人</li>
              <li>· 希望被告知&ldquo;全部答案&rdquo;而不是被帮助思考</li>
              <li>· 刚入行、基础还没打牢的同学</li>
              <li>· 想通过购买缓解焦虑而不想改变行为</li>
            </ul>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">常见问题</h2>
          <div className="mx-auto mt-8 max-w-3xl space-y-4">
            {[
              {
                q: '为什么不做低价订阅，比如 ¥39/月？',
                a: '因为我不想做那种"每月扣钱但你不真的用"的订阅。入会是一年一付，目的是让你只在真正需要时来；1v1 更贵，因为它占用我的时间而不是内容。',
              },
              {
                q: '1v1 到底能帮我什么？',
                a: '我不会给你"该学什么"的清单。我会听你现在的阶段，帮你判断：哪些技术变化和你有关、哪些只是噪音、你下一步具体该做什么（3-5 个可执行动作）。',
              },
              {
                q: '和看公众号、买课有什么区别？',
                a: '公众号是一对多广播，买课是系统知识。1v1 解决的是"把这些信息用在我身上"这最后一公里——没有这一步，前面看再多都只是缓解焦虑。',
              },
              {
                q: '不满意可以退吗？',
                a: '入会 30 天无理由全额退。1v1 如果连麦后觉得没有帮助，剩余次数可退款。我宁可退钱，也不想你抱着"被骗"的感觉离开。',
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950"
              >
                <summary className="cursor-pointer text-base font-semibold text-gray-900 dark:text-white">
                  {item.q}
                </summary>
                <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

import Link from 'next/link';

const productLinks = [
  { label: '每日情报', href: '/' },
  { label: '决策简报', href: '/brief' },
  { label: '转型路线', href: '/roadmap' },
  { label: '前端周刊', href: '/weekly' },
];

const membershipLinks = [
  { label: '加入过滤器', href: '/order?plan=yearly' },
  { label: '1v1 定制化交流', href: '/order?plan=1v1' },
  { label: '邮件订阅（免费）', href: '/subscribe' },
];

const communityLinks = [
  { label: 'GitHub 仓库', href: 'https://github.com/TUARAN/frontend-weekly-digest-cn', external: true },
  { label: '公众号《前端周看》', href: '#', external: false },
  { label: '微信群（备注"前端周刊"）', href: '#', external: false },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">前端下一步 · 技术情报站</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-gray-500 dark:text-gray-400">
              帮前端开发者在 AI 时代做出正确技术决策。
            </p>
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">
              &copy; {new Date().getFullYear()} Frontend Weekly Digest CN
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">产品</p>
            <ul className="mt-4 space-y-2">
              {productLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">会员</p>
            <ul className="mt-4 space-y-2">
              {membershipLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">社区</p>
            <ul className="mt-4 space-y-2">
              {communityLinks.map((l) => (
                <li key={l.label}>
                  {l.external ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-600 dark:text-gray-400">{l.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-gray-200 pt-6 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-500 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <span id="busuanzi_container_site_pv">
              本站总访问量 <span id="busuanzi_value_site_pv"></span> 次
            </span>
            <span id="busuanzi_container_site_uv">
              本站访客数 <span id="busuanzi_value_site_uv"></span> 人
            </span>
          </div>
          <p className="font-medium">Signals over noise.</p>
        </div>
      </div>
    </footer>
  );
}

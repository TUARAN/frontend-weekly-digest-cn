export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">前端下一步 · 技术情报站</p>
            <p className="max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              不再提供更多内容，而是提供更高密度的信号。用结构化数据与 AI Agent，把信息搬运升级为技术判断。
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Frontend Weekly Digest CN
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm text-gray-500 dark:text-gray-400 md:items-end">
            <div className="flex flex-wrap items-center gap-3">
              <span id="busuanzi_container_site_pv">
                本站总访问量 <span id="busuanzi_value_site_pv"></span> 次
              </span>
              <span id="busuanzi_container_site_uv">
                本站访客数 <span id="busuanzi_value_site_uv"></span> 人
              </span>
            </div>
            <p>Signals over noise.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

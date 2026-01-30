import { getAllWeeklies } from '@/lib/weekly';
import WeeklyCard from '@/components/WeeklyCard';
import Image from 'next/image';
import { Github } from 'lucide-react';

export default function Home() {
  const weeklies = getAllWeeklies();

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:py-12">
      {/* Hero Section */}
      <section className="mb-12 flex flex-col items-center text-center">
        <div className="relative mb-8 w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl ring-1 ring-gray-900/5 dark:ring-white/10">
          <Image
            src="/banner.png"
            alt="前端周刊 Banner"
            width={1200}
            height={600}
            className="w-full object-cover"
            priority={false}
            loading="lazy"
          />
        </div>

        <p className="mx-auto mb-8 max-w-3xl text-2xl font-bold leading-relaxed text-gray-800 dark:text-gray-100 md:text-3xl">
          每周更新国外论坛的前端热门文章，推荐大家阅读/翻译，<br className="hidden md:block" />
          紧跟时事，掌握前端技术动态。
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="https://github.com/TUARAN/frontend-weekly-digest-cn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-8 py-3 text-lg font-medium text-white transition-all hover:bg-gray-800 hover:scale-105 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            <Github className="h-5 w-5" />
            GitHub 仓库
          </a>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">最新发布</h2>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {weeklies.map((post) => (
            <WeeklyCard key={post.slug} post={post} />
          ))}
        </div>
      </div>

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
            扫码加群
          </div>
        </div>
      </div>
    </div>
  );
}

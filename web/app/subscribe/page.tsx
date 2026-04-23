import Link from 'next/link';
import { ArrowLeft, Mail, MessageCircle } from 'lucide-react';
import NewsletterSignup from '@/components/NewsletterSignup';

export const metadata = {
  title: '订阅邮件周报 · 前端下一步',
  description: '每周一封，当周最值得停下来的 1-2 个技术决策。',
};

export default function SubscribePage() {
  return (
    <div className="container mx-auto px-4 py-16 md:px-6">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          返回首页
        </Link>

        <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950 md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Newsletter</p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">每周一封邮件</h1>
          <p className="mt-3 text-base leading-7 text-gray-600 dark:text-gray-400">
            当周最值得停下来的 1-2 个技术决策，周一早上发到你邮箱。
          </p>

          <div className="mt-8">
            <NewsletterSignup placeholder="输入你的邮箱" buttonLabel="免费订阅" />
          </div>

          <div className="mt-8 grid gap-4 border-t border-gray-200 pt-8 dark:border-gray-800 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="inline-flex rounded-xl bg-blue-50 p-2 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">每周一早发送</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">你可以随时一键退订。</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="inline-flex rounded-xl bg-blue-50 p-2 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">想直接加群？</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  微信加 <span className="font-mono">atar24</span>，备注&ldquo;前端周刊&rdquo;。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

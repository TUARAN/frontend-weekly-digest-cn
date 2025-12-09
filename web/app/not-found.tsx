import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        抱歉，找不到您要访问的页面。
      </p>
      <Link
        href="/"
        className="rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      >
        返回首页
      </Link>
    </div>
  );
}

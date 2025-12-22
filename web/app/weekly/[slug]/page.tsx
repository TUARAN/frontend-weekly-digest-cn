import { getWeeklyBySlug, getAllWeeklies } from '@/lib/weekly';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: { slug: string } | Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  const weeklies = getAllWeeklies();
  return weeklies.map((post) => ({
    slug: post.slug,
  }));
}

export default async function WeeklyPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getWeeklyBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="mb-8">
        <Link 
          href="/"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          返回列表
        </Link>
      </div>

      <article className="prose prose-lg mx-auto dark:prose-invert prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:text-blue-800 dark:hover:prose-a:text-blue-300 prose-img:rounded-xl">
        <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
          {post.title}
        </h1>
        
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </article>
    </div>
  );
}

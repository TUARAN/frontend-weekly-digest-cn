import { getArticleContent, getWeeklyMenu } from '@/lib/weekly';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string; article: string[] }>;
}

export async function generateStaticParams() {
  const menu = getWeeklyMenu();
  const params: { slug: string; article: string[] }[] = [];
  
  menu.forEach(issue => {
    if (issue.children && issue.slug) {
      issue.children.forEach(child => {
        if (!child.path.startsWith('http')) {
           // path is /weekly/slug/path/to/article
           // e.g. /weekly/442/subdir/file
           const parts = child.path.split('/').slice(3); // remove empty, weekly, slug
           if (parts.length > 0) {
               params.push({
                   slug: issue.slug!,
                   article: parts
               });
           }
        }
      });
    }
  });
  
  return params;
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug, article } = await params;
  const content = getArticleContent(slug, article);

  if (!content) {
    notFound();
  }
  
  const titleMatch = content.match(/^#\s+(.*)/);
  const title = titleMatch ? titleMatch[1] : article[article.length - 1];

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="mb-8">
        <Link 
          href={`/weekly/${slug}`}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          返回第 {slug} 期
        </Link>
      </div>

      <article className="prose prose-lg mx-auto dark:prose-invert prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:text-blue-800 dark:hover:prose-a:text-blue-300 prose-img:rounded-xl">
        {!titleMatch && (
            <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
            {title}
            </h1>
        )}
        
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}

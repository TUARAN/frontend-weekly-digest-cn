import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const content = `
# 关于本项目

> 📘 将全球前端领域的高质量内容带给中文开发者

## 📖 项目简介

本项目是对英文原版《Frontend Weekly Digest》的持续翻译整理，致力于为中文开发者提供系统性的海外前端技术动态跟踪。

**内容涵盖：** Web 开发、CSS、JavaScript、React、开发工具、性能优化、动效设计等多个方向。每期精选 20~30 篇文章，力求信息密度高、可读性强、技术趋势清晰。

**筛选方式：** 我们不靠算法推荐，而是由前端开发者基于对技术趋势的敏锐洞察，手动筛选每周全球社区中最新、最热、最值得关注的前端文章。

**信息源：** 跟踪海外一线技术平台，包括 Medium、Smashing、LogRocket、WebKit Blog 等。

## 🎯 为什么做这个项目

**中文社区缺乏系统性跟踪海外一手前端动态的内容**。而国外一线技术平台每周都在迸发新洞见、新 API、新标准、新框架。我们希望中文开发者不仅能读到优质文章，更能通过这种方式与全球前端开发者同步成长。

**项目历程：** 此前在 Flowus 平台上，我和另外 4 位小伙伴一起逐期翻译《前端周刊》内的每篇文章。由于 Flowus 付费空间有限，现在将项目迁移到 GitHub，同时号召更多小伙伴加入，一起用热爱发电！

## 🤝 协作方式

欢迎参与翻译！详情请查看 [GitHub 仓库](https://github.com/TUARAN/frontend-weekly-digest-cn)。
`;

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <article className="prose prose-lg mx-auto dark:prose-invert prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:text-blue-800 dark:hover:prose-a:text-blue-300">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}

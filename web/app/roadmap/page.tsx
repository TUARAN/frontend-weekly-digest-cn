import Link from 'next/link';
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react';

export const metadata = {
  title: '前端 → AI Agent 转型路线 · 前端周看',
  description: '一张为 3-5 年前端打造的能力地图，把从"写组件"到"构建 Agent"的路径拆成可执行的阶段。',
};

interface Stage {
  phase: string;
  title: string;
  weeks: string;
  goal: string;
  skills: string[];
  deliverable: string;
}

const stages: Stage[] = [
  {
    phase: 'Phase 0',
    title: '基座校准',
    weeks: '1-2 周',
    goal: '确认自己是"该转"还是"该深耕"，避免走错方向。',
    skills: [
      '6 条判断信号自测',
      '当前岗位的可替代性评估',
      '个人优势画像',
    ],
    deliverable: '一份"去或不去"的自我判断书',
  },
  {
    phase: 'Phase 1',
    title: 'LLM 基础 + Prompt 工程',
    weeks: '3-4 周',
    goal: '从会调 API，到能设计 prompt、懂成本、懂失败模式。',
    skills: [
      'OpenAI / Anthropic API 调用',
      'Prompt 模板与版本化',
      'Token 成本估算',
      'Evals 设计与回归测试',
    ],
    deliverable: '一个带 evals 的 Prompt 管理工程',
  },
  {
    phase: 'Phase 2',
    title: 'Agent 核心模式',
    weeks: '4-6 周',
    goal: '掌握 Tool Use、ReAct、Reflection 等关键 Agent 模式。',
    skills: [
      'Tool / Function Calling 实战',
      'ReAct / Plan-Execute',
      'Multi-Agent 编排',
      'MCP 协议与生态',
    ],
    deliverable: '一个可跑通的任务型 Agent',
  },
  {
    phase: 'Phase 3',
    title: '生产级工程化',
    weeks: '6-8 周',
    goal: '把 demo 变产品：可观测、可灰度、可回滚。',
    skills: [
      'LangSmith / Langfuse 观测',
      'Agent 的流式 UI 模式',
      '失败处理与兜底策略',
      '成本监控与限流',
    ],
    deliverable: '一个上线到内部业务的 Agent 项目',
  },
  {
    phase: 'Phase 4',
    title: '求职冲刺',
    weeks: '2-4 周',
    goal: '把前面的积累，翻译成面试官听得懂的语言。',
    skills: [
      '高频面试题库',
      '简历改造模板',
      '项目故事化叙述',
      '模拟面试与复盘',
    ],
    deliverable: '拿到 2+ offer，对比后择优',
  },
];

export default function RoadmapPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Roadmap</p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">
            前端 → AI Agent 转型路线
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-gray-600 dark:text-gray-300 md:text-lg">
            给 3-5 年经验前端的一张能力地图。把从&ldquo;写组件&rdquo;到&ldquo;构建 Agent&rdquo;拆成 5 个可执行的阶段，每个阶段都有明确的目标、技能清单和交付物。
          </p>
        </div>

        <div className="space-y-6">
          {stages.map((stage, idx) => (
            <div
              key={stage.phase}
              className="relative rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950 md:p-8"
            >
              <div className="flex flex-col gap-5 md:flex-row">
                <div className="md:w-1/3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {stage.phase} · {stage.weeks}
                  </div>
                  <h2 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">{stage.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">{stage.goal}</p>
                </div>

                <div className="md:w-2/3">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">核心能力</p>
                  <ul className="space-y-2">
                    {stage.skills.map((s) => (
                      <li key={s} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-300">
                    <span className="font-semibold">阶段交付：</span>
                    {stage.deliverable}
                  </div>
                </div>
              </div>
              {idx < stages.length - 1 ? (
                <div className="absolute -bottom-4 left-1/2 z-10 -translate-x-1/2">
                  <Circle className="h-3 w-3 fill-gray-300 text-gray-300 dark:fill-gray-700 dark:text-gray-700" />
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-gray-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8 dark:border-gray-800 dark:from-blue-950/40 dark:via-gray-950 dark:to-indigo-950/40 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">路线只是地图，动手才是路</h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-gray-600 dark:text-gray-300">
            这张路线图会继续随着前端、AI Coding 和 Agent 工程实践更新。公开内容优先沉淀成可复用的清单、文章和项目记录。
          </p>
          <Link
            href="/subscribe"
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            订阅后续更新
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

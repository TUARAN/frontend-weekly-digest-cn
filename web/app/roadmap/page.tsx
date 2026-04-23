import Link from 'next/link';
import { CheckCircle2, Circle, Lock, Sparkles, ArrowRight } from 'lucide-react';

export const metadata = {
  title: '前端 → AI Agent 转型路线 · 前端下一步',
  description: '一张为 3-5 年前端打造的能力地图，把从"写组件"到"构建 Agent"的路径拆成可执行的阶段。',
};

interface Stage {
  phase: string;
  title: string;
  weeks: string;
  goal: string;
  skills: { name: string; free: boolean }[];
  deliverable: string;
}

const stages: Stage[] = [
  {
    phase: 'Phase 0',
    title: '基座校准',
    weeks: '1-2 周',
    goal: '确认自己是"该转"还是"该深耕"，避免走错方向。',
    skills: [
      { name: '6 条判断信号自测', free: true },
      { name: '当前岗位的可替代性评估', free: true },
      { name: '个人优势画像', free: false },
    ],
    deliverable: '一份"去或不去"的自我判断书',
  },
  {
    phase: 'Phase 1',
    title: 'LLM 基础 + Prompt 工程',
    weeks: '3-4 周',
    goal: '从会调 API，到能设计 prompt、懂成本、懂失败模式。',
    skills: [
      { name: 'OpenAI / Anthropic API 调用', free: true },
      { name: 'Prompt 模板与版本化', free: true },
      { name: 'Token 成本估算', free: false },
      { name: 'Evals 设计与回归测试', free: false },
    ],
    deliverable: '一个带 evals 的 Prompt 管理工程',
  },
  {
    phase: 'Phase 2',
    title: 'Agent 核心模式',
    weeks: '4-6 周',
    goal: '掌握 Tool Use、ReAct、Reflection 等关键 Agent 模式。',
    skills: [
      { name: 'Tool / Function Calling 实战', free: true },
      { name: 'ReAct / Plan-Execute', free: false },
      { name: 'Multi-Agent 编排', free: false },
      { name: 'MCP 协议与生态', free: false },
    ],
    deliverable: '一个可跑通的任务型 Agent',
  },
  {
    phase: 'Phase 3',
    title: '生产级工程化',
    weeks: '6-8 周',
    goal: '把 demo 变产品：可观测、可灰度、可回滚。',
    skills: [
      { name: 'LangSmith / Langfuse 观测', free: false },
      { name: 'Agent 的流式 UI 模式', free: false },
      { name: '失败处理与兜底策略', free: false },
      { name: '成本监控与限流', free: false },
    ],
    deliverable: '一个上线到内部业务的 Agent 项目',
  },
  {
    phase: 'Phase 4',
    title: '求职冲刺',
    weeks: '2-4 周',
    goal: '把前面的积累，翻译成面试官听得懂的语言。',
    skills: [
      { name: '高频面试题库', free: false },
      { name: '简历改造模板', free: false },
      { name: '项目故事化叙述', free: false },
      { name: '模拟面试与复盘', free: false },
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
            给 3-5 年经验前端的一张能力地图。把从"写组件"到"构建 Agent"拆成 5 个可执行的阶段，每个阶段都有明确的目标、技能清单和交付物。
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/pro"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-blue-500 hover:to-indigo-500"
            >
              <Sparkles className="h-4 w-4" />
              解锁完整路线图
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/brief"
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:border-gray-400 dark:border-gray-700 dark:text-gray-100"
            >
              看决策简报
            </Link>
          </div>
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
                      <li key={s.name} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        {s.free ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        ) : (
                          <Lock className="h-4 w-4 shrink-0 text-amber-500" />
                        )}
                        <span>{s.name}</span>
                        {s.free ? (
                          <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                            免费
                          </span>
                        ) : (
                          <span className="ml-auto rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                            Pro
                          </span>
                        )}
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
            Pro 会员可获得每个阶段的：详细任务清单、推荐学习资料、可跑通的实战项目、面试题库、以及作者的 1v1 群内答疑。
          </p>
          <Link
            href="/pro"
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            查看 Pro 权益与定价
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

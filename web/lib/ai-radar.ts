export const contentTiers = [
  {
    name: '速递',
    length: '300-500 字',
    cadence: '每日 1-3 条',
    fit: '推文、产品发布、benchmark',
    intent: '24 小时内把信号转成中文判断，适合快速转发和收藏。',
  },
  {
    name: '精译',
    length: '1500-3000 字',
    cadence: '每周 2-3 篇',
    fit: '优质长文、技术博客',
    intent: '保留原文价值，但重写标题、结构和中文表达，读起来像中文作者写的。',
  },
  {
    name: '深读',
    length: '5000+ 字',
    cadence: '每月 1-2 篇',
    fit: '论文解读、行业分析',
    intent: '补足背景、画出技术关系图，给前端和 AI 开发者明确行动建议。',
  },
];

export const signalSources = [
  {
    level: '一手',
    sources: 'Anthropic / OpenAI / Google DeepMind 官方博客、Twitter/X 关键账号',
    priority: '最高',
  },
  {
    level: '社区',
    sources: 'Hacker News 高分帖、Reddit r/LocalLLaMA、Twitter 算法推荐',
    priority: '高',
  },
  {
    level: '聚合',
    sources: "The Batch、Import AI、Latent Space、Ben's Bites",
    priority: '中',
  },
  {
    level: '论文',
    sources: 'arXiv cs.AI / cs.CL、Papers With Code',
    priority: '中',
  },
  {
    level: '国内对照',
    sources: '机器之心、量子位',
    priority: '去重',
  },
];

export const workflowSteps = [
  {
    title: '原文采集',
    owner: 'RSS / 手动',
    detail: '先用 RSS + Twitter List 聚合，配合 Inoreader / Feedly 做人工筛选。',
  },
  {
    title: 'Claude 初译',
    owner: '翻译 Prompt',
    detail: '按「前端下一步」译者 prompt 输出结构化 HTML，先解决信息完整度。',
  },
  {
    title: '人工审校',
    owner: 'Diff 工具',
    detail: '保留人工判断，重点检查术语、事实、标题和中文表达。',
  },
  {
    title: '二次润色',
    owner: '编辑视角',
    detail: '补上「对前端开发者意味着什么」，避免只是搬运翻译。',
  },
  {
    title: '配图/排版',
    owner: 'HTML 模板',
    detail: '用流程图、对比卡片、demo 截图做可视化表达。',
  },
  {
    title: '发布',
    owner: 'SSG / ISR',
    detail: '先静态发布，后续再接 CMS、待审队列和邮件/RSS 分发。',
  },
];

export const roadmapLevels = [
  {
    name: 'Level 1',
    title: '纯内容栏目',
    duration: '1-2 天',
    scope: '/ai-radar 路由、MDX 内容、日期/分类组织、SSG 发布',
  },
  {
    name: 'Level 2',
    title: '内容管理后台',
    duration: '1-2 周',
    scope: '接 Notion / Sanity / Contentlayer，增加翻译工作台和 ISR 发布',
  },
  {
    name: 'Level 3',
    title: '半自动化采集',
    duration: '1-2 个月',
    scope: 'Cron 拉 RSS / Twitter，Claude 初译进入待审队列，审校后订阅分发',
  },
];

export const promptGuidelines = [
  '通俗化：把英文长句拆短，用中文技术圈惯用表达。',
  '保留：代码、命令、专有名词，首次出现给中文加英文括注。',
  '重写：标题改成中文读者一眼能懂的钩子式标题。',
  '增补：开头加 50 字「为什么值得读」TL;DR。',
  '风格：第一人称口语化，避免翻译腔。',
  '格式：直接输出 HTML，使用本站设计系统类名。',
];

export const differentiators = [
  '角度差异：每篇都补一段「对前端开发者意味着什么」。',
  '形态差异：用 HTML 可视化做流程图、demo、对比卡片。',
  '速度差异：押注 24 小时内快讯，不和深度长文号正面竞争。',
  '互动差异：底部加「你觉得这事影响有多大」投票。',
];

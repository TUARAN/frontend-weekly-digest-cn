export type OrderPlanId = 'yearly' | 'trial' | '1v1';

export interface OrderPlan {
  id: OrderPlanId;
  name: string;
  subtitle: string;
  price: number;
  priceLabel: string;
  features: string[];
  needsQuestionnaire?: boolean;
}

export const ORDER_PLANS: Record<OrderPlanId, OrderPlan> = {
  yearly: {
    id: 'yearly',
    name: '支持者 · 年度',
    subtitle: '一年一付，不自动续费，先做轻量支持',
    price: 99,
    priceLabel: '¥99 / 年',
    features: [
      '每日精选历史归档',
      '路线图持续更新',
      '每月一封重点回顾',
      '读者交流入口',
    ],
  },
  trial: {
    id: 'trial',
    name: '1v1 · 试聊',
    subtitle: '单次 45 分钟，先确认是否真的有帮助',
    price: 199,
    priceLabel: '¥199 / 次',
    features: [
      '1 次 45 分钟 1v1 连麦',
      '会前简短问卷',
      '会后三条下一步建议',
      '不合适可不继续购买',
    ],
    needsQuestionnaire: true,
  },
  '1v1': {
    id: '1v1',
    name: '1v1 · 三次陪跑',
    subtitle: '含 3 次 45 分钟连麦（3 个月内用完）',
    price: 599,
    priceLabel: '¥599 / 3 次',
    features: [
      '含一年支持者权益',
      '3 次 45 分钟 1v1 连麦',
      '会前问卷 + 会后建议清单',
      '适合已经有明确问题的人',
    ],
    needsQuestionnaire: true,
  },
};

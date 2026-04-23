export type OrderPlanId = 'yearly' | '1v1';

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
    name: '入会 · 过滤器',
    subtitle: '一年一付，不搞自动续费',
    price: 299,
    priceLabel: '¥299 / 年',
    features: [
      '全部决策简报',
      '转型路线图完整版',
      '每月一封会员信',
      '专属读者微信群',
    ],
  },
  '1v1': {
    id: '1v1',
    name: '1v1 定制化交流',
    subtitle: '含 3 次 1 小时连麦（半年内用完）',
    price: 1499,
    priceLabel: '¥1,499 起',
    features: [
      '入会一年权益',
      '3 次 1 小时 1v1 连麦',
      '会前问卷 + 会后一页纪要',
      '群内优先答疑',
    ],
    needsQuestionnaire: true,
  },
};

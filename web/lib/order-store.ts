import fs from 'node:fs';
import path from 'node:path';

export type OrderPlan = 'yearly' | '1v1';
export type OrderStatus = 'created' | 'payment_submitted' | 'confirmed' | 'closed';
export type OrderPayMethod = 'wechat' | 'alipay';
export type PaymentProvider = 'xunhu' | 'official';
export type PaymentChannel = 'alipay_page' | 'alipay_wap' | 'wechat_native' | 'wechat_h5' | 'xunhu_cashier';

export interface PaymentSession {
  provider: PaymentProvider;
  payMethod: OrderPayMethod;
  channel: PaymentChannel;
  payUrl?: string;
  codeUrl?: string;
  qrcodeUrl?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface StoredOrder {
  orderNo: string;
  plan: OrderPlan;
  amount: number;
  name: string;
  wechat: string;
  email?: string;
  note?: string;
  payMethod?: OrderPayMethod;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  paymentSubmittedAt?: string;
  paymentSession?: PaymentSession;
  providerTradeNo?: string;
  paidAt?: string;
  rawNotify?: unknown;
}

const ordersDir = path.join(process.cwd(), '.orders');

function ensureOrdersDir() {
  fs.mkdirSync(ordersDir, { recursive: true });
}

function getOrderPath(orderNo: string) {
  return path.join(ordersDir, `${orderNo}.json`);
}

export function isValidOrderPlan(value: unknown): value is OrderPlan {
  return value === 'yearly' || value === '1v1';
}

export function isValidPayMethod(value: unknown): value is OrderPayMethod {
  return value === 'wechat' || value === 'alipay';
}

export function readOrder(orderNo: string) {
  const orderPath = getOrderPath(orderNo);
  if (!fs.existsSync(orderPath)) return null;
  return JSON.parse(fs.readFileSync(orderPath, 'utf8')) as StoredOrder;
}

export function saveOrder(order: StoredOrder) {
  ensureOrdersDir();
  fs.writeFileSync(getOrderPath(order.orderNo), JSON.stringify(order, null, 2), 'utf8');
  return order;
}

export function createOrder(input: {
  orderNo: string;
  plan: OrderPlan;
  amount: number;
  name: string;
  wechat: string;
  email?: string;
  note?: string;
}) {
  const now = new Date().toISOString();
  const order: StoredOrder = {
    ...input,
    email: input.email?.trim() || undefined,
    note: input.note?.trim() || undefined,
    status: 'created',
    createdAt: now,
    updatedAt: now,
  };
  return saveOrder(order);
}

export function markOrderPaymentSubmitted(orderNo: string, payMethod: OrderPayMethod) {
  const order = readOrder(orderNo);
  if (!order) return null;
  const now = new Date().toISOString();
  const updated: StoredOrder = {
    ...order,
    payMethod,
    status: 'payment_submitted',
    paymentSubmittedAt: now,
    updatedAt: now,
  };
  return saveOrder(updated);
}

export function setOrderPaymentSession(orderNo: string, paymentSession: PaymentSession) {
  const order = readOrder(orderNo);
  if (!order) return null;
  const updated: StoredOrder = {
    ...order,
    payMethod: paymentSession.payMethod,
    paymentSession,
    updatedAt: new Date().toISOString(),
  };
  return saveOrder(updated);
}

export function markOrderConfirmed(orderNo: string, input: { providerTradeNo?: string; rawNotify?: unknown }) {
  const order = readOrder(orderNo);
  if (!order) return null;
  const now = new Date().toISOString();
  const updated: StoredOrder = {
    ...order,
    status: 'confirmed',
    providerTradeNo: input.providerTradeNo ?? order.providerTradeNo,
    paidAt: order.paidAt ?? now,
    rawNotify: input.rawNotify ?? order.rawNotify,
    updatedAt: now,
  };
  return saveOrder(updated);
}

function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing env: ${name}`);
  }
  return value;
}

export function getSiteUrl() {
  return requireEnv('SITE_URL');
}

export function getAlipayConfig() {
  return {
    appId: requireEnv('ALIPAY_APP_ID'),
    privateKey: requireEnv('ALIPAY_PRIVATE_KEY'),
    publicKey: requireEnv('ALIPAY_PUBLIC_KEY'),
    gateway: process.env.ALIPAY_GATEWAY?.trim() || 'https://openapi.alipay.com/gateway.do',
  };
}

export function getWechatPayConfig() {
  return {
    appId: requireEnv('WECHAT_PAY_APP_ID'),
    mchId: requireEnv('WECHAT_PAY_MCH_ID'),
    serialNo: requireEnv('WECHAT_PAY_SERIAL_NO'),
    privateKey: requireEnv('WECHAT_PAY_PRIVATE_KEY'),
    apiV3Key: requireEnv('WECHAT_PAY_API_V3_KEY'),
    platformPublicKey: requireEnv('WECHAT_PAY_PLATFORM_PUBLIC_KEY'),
    baseUrl: process.env.WECHAT_PAY_BASE_URL?.trim() || 'https://api.mch.weixin.qq.com',
  };
}

export function paymentEnvEnabled() {
  return {
    alipay:
      Boolean(process.env.SITE_URL) &&
      Boolean(process.env.ALIPAY_APP_ID) &&
      Boolean(process.env.ALIPAY_PRIVATE_KEY),
    wechat:
      Boolean(process.env.SITE_URL) &&
      Boolean(process.env.WECHAT_PAY_APP_ID) &&
      Boolean(process.env.WECHAT_PAY_MCH_ID) &&
      Boolean(process.env.WECHAT_PAY_PRIVATE_KEY) &&
      Boolean(process.env.WECHAT_PAY_SERIAL_NO) &&
      Boolean(process.env.WECHAT_PAY_API_V3_KEY),
    xunhu:
      Boolean(process.env.SITE_URL) &&
      ((Boolean(process.env.XUNHU_ALIPAY_APP_ID) && Boolean(process.env.XUNHU_ALIPAY_APP_SECRET)) ||
        (Boolean(process.env.XUNHU_WECHAT_APP_ID) && Boolean(process.env.XUNHU_WECHAT_APP_SECRET))),
  };
}

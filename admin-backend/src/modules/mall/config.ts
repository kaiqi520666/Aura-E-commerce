import { ModuleConfig } from '@cool-midway/core';

/**
 * 模块配置
 */
export default () => {
  return {
    // 模块名称
    name: '商城模块',
    // 模块描述
    description: '商城相关的功能模块',
    // 前端商城地址，用于支付完成后跳转结果页
    frontendBaseUrl: 'http://localhost:5173',
    paypal: {
      clientId: process.env.PAYPAL_CLIENT_ID || '',
      clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
      env: process.env.PAYPAL_ENV || 'sandbox',
      webhookId: process.env.PAYPAL_WEBHOOK_ID || '',
      currency: process.env.PAYPAL_CURRENCY || 'USD',
    },
    // 中间件，只对本模块有效
    middlewares: [],
    // 中间件，全局有效
    globalMiddlewares: [],
    // 模块加载顺序，默认为0，值越大越优先加载
    order: 0,
  } as ModuleConfig;
};

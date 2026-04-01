import axios, { AxiosInstance } from 'axios';
import { Config, Provide } from '@midwayjs/core';
import { CoolCommException } from '@cool-midway/core';

type PaypalOrderResponse = {
  id: string;
  status: string;
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
      }>;
    };
  }>;
};

@Provide()
export class MallPaypalService {
  @Config('module.mall.paypal')
  paypalConfig: {
    clientId: string;
    clientSecret: string;
    env: string;
    webhookId: string;
    currency: string;
  };

  private accessToken = '';

  private accessTokenExpiresAt = 0;

  private get baseUrl() {
    return this.paypalConfig?.env === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  private get client(): AxiosInstance {
    return axios.create({
      baseURL: this.baseUrl,
      timeout: 15000,
    });
  }

  private ensureConfigured() {
    if (!this.paypalConfig?.clientId || !this.paypalConfig?.clientSecret) {
      throw new CoolCommException('PayPal 未配置，请检查环境变量');
    }
  }

  private parseErrorMessage(error: any, fallback: string) {
    const data = error?.response?.data;
    const details =
      Array.isArray(data?.details) && data.details.length
        ? data.details
            .map(item => item.description || item.issue)
            .filter(Boolean)
            .join('；')
        : '';
    return details || data?.message || fallback;
  }

  private async getAccessToken() {
    this.ensureConfigured();

    if (this.accessToken && Date.now() < this.accessTokenExpiresAt) {
      return this.accessToken;
    }

    try {
      const auth = Buffer.from(
        `${this.paypalConfig.clientId}:${this.paypalConfig.clientSecret}`
      ).toString('base64');
      const params = new URLSearchParams();
      params.set('grant_type', 'client_credentials');

      const { data } = await this.client.post('/v1/oauth2/token', params, {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      this.accessToken = data.access_token;
      this.accessTokenExpiresAt =
        Date.now() + Math.max(Number(data.expires_in || 0) - 60, 60) * 1000;

      return this.accessToken;
    } catch (error) {
      throw new CoolCommException(
        this.parseErrorMessage(error, '获取 PayPal access token 失败')
      );
    }
  }

  private async authorizedRequest<T = any>(
    method: 'GET' | 'POST',
    url: string,
    data?: any,
    headers: Record<string, any> = {}
  ) {
    const token = await this.getAccessToken();
    const response = await this.client.request<T>({
      method,
      url,
      data,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...headers,
      },
    });
    return response.data;
  }

  async createOrder(options: {
    paymentNo: string;
    orderNo: string;
    amount: number;
  }) {
    try {
      const amount = Number(options.amount).toFixed(2);
      const response = await this.authorizedRequest<PaypalOrderResponse>(
        'POST',
        '/v2/checkout/orders',
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: options.paymentNo,
              custom_id: options.paymentNo,
              description: `AURA order ${options.orderNo}`,
              amount: {
                currency_code: this.paypalConfig.currency || 'USD',
                value: amount,
              },
            },
          ],
          payment_source: {
            paypal: {
              experience_context: {
                brand_name: 'AURA',
                user_action: 'PAY_NOW',
                shipping_preference: 'NO_SHIPPING',
              },
            },
          },
        },
        {
          'PayPal-Request-Id': options.paymentNo,
          Prefer: 'return=representation',
        }
      );

      if (!response?.id) {
        throw new CoolCommException('PayPal 订单创建失败');
      }

      return response;
    } catch (error) {
      if (error instanceof CoolCommException) {
        throw error;
      }
      throw new CoolCommException(
        this.parseErrorMessage(error, 'PayPal 订单创建失败')
      );
    }
  }

  async captureOrder(options: { paymentNo: string; paypalOrderId: string }) {
    try {
      return await this.authorizedRequest<PaypalOrderResponse>(
        'POST',
        `/v2/checkout/orders/${options.paypalOrderId}/capture`,
        {},
        {
          'PayPal-Request-Id': `${options.paymentNo}-capture`,
          Prefer: 'return=representation',
        }
      );
    } catch (error) {
      throw new CoolCommException(
        this.parseErrorMessage(error, 'PayPal 扣款失败')
      );
    }
  }

  getCaptureId(response: PaypalOrderResponse) {
    return (
      response?.purchase_units?.[0]?.payments?.captures?.[0]?.id || response?.id
    );
  }

  isCaptureCompleted(response: PaypalOrderResponse) {
    if (response?.status === 'COMPLETED') {
      return true;
    }
    return (
      response?.purchase_units?.[0]?.payments?.captures?.[0]?.status ===
      'COMPLETED'
    );
  }

  async verifyWebhook(headers: Record<string, any>, event: Record<string, any>) {
    if (!this.paypalConfig?.webhookId) {
      throw new CoolCommException('PayPal webhookId 未配置');
    }

    try {
      const response = await this.authorizedRequest<{ verification_status: string }>(
        'POST',
        '/v1/notifications/verify-webhook-signature',
        {
          auth_algo: headers['paypal-auth-algo'],
          cert_url: headers['paypal-cert-url'],
          transmission_id: headers['paypal-transmission-id'],
          transmission_sig: headers['paypal-transmission-sig'],
          transmission_time: headers['paypal-transmission-time'],
          webhook_id: this.paypalConfig.webhookId,
          webhook_event: event,
        }
      );

      return response?.verification_status === 'SUCCESS';
    } catch (error) {
      throw new CoolCommException(
        this.parseErrorMessage(error, 'PayPal webhook 验签失败')
      );
    }
  }
}

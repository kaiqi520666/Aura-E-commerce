import * as moment from 'moment';
import { Config, Inject, Provide } from '@midwayjs/core';
import {
  BaseService,
  CoolCommException,
  CoolTransaction,
} from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { MallPaymentEntity } from '../entity/payment';
import { MallOrderEntity } from '../entity/order';
import { MallPaypalService } from './paypal';

/**
 * 支付
 */
@Provide()
export class MallPaymentService extends BaseService {
  @InjectEntityModel(MallPaymentEntity)
  mallPaymentEntity: Repository<MallPaymentEntity>;

  @InjectEntityModel(MallOrderEntity)
  mallOrderEntity: Repository<MallOrderEntity>;

  @Inject()
  mallPaypalService: MallPaypalService;

  @Config('module.mall.frontendBaseUrl')
  frontendBaseUrl: string;

  private createPaymentNo() {
    return `PAY${moment().format('YYYYMMDDHHmmss')}${Math.floor(
      Math.random() * 9000 + 1000
    )}`;
  }

  private ensureProvider(provider: string) {
    if (!['paypal', 'epusdt'].includes(provider)) {
      throw new CoolCommException('支付方式不支持');
    }
  }

  private buildCheckoutUrl(provider: string, paymentNo: string) {
    return `/api/open/mall/epusdt/checkout?paymentNo=${paymentNo}`;
  }

  private buildResultUrl(
    status: string,
    paymentNo: string,
    orderNo: string,
    isProxyPayment = false
  ) {
    const baseUrl = (this.frontendBaseUrl || '').replace(/\/$/, '');
    const resultPath = `/payment-result?status=${status}&paymentNo=${paymentNo}&orderNo=${orderNo}&proxy=${isProxyPayment ? 1 : 0}`;
    return baseUrl ? `${baseUrl}${resultPath}` : resultPath;
  }

  private async findOrderForUser(orderId: number, userId: number) {
    const order = await this.mallOrderEntity.findOneBy({ id: orderId, userId });
    if (!order) {
      throw new CoolCommException('订单不存在');
    }
    if (order.status !== 'PENDING_PAYMENT') {
      throw new CoolCommException('当前订单不可支付');
    }
    return order;
  }

  private async findOrderForProxyToken(proxyToken: string) {
    const order = await this.mallOrderEntity.findOneBy({ proxyToken });
    if (!order) {
      throw new CoolCommException('代付订单不存在');
    }
    if (order.status !== 'PENDING_PAYMENT') {
      throw new CoolCommException('当前订单不可支付');
    }
    return order;
  }

  private async createPendingPayment(
    order: MallOrderEntity,
    provider: string,
    isProxyPayment = false,
    proxyToken?: string
  ) {
    await this.cancelPendingPayments(order.id, {
      provider,
      isProxyPayment,
    });

    const payment = await this.mallPaymentEntity.save({
      paymentNo: this.createPaymentNo(),
      orderId: order.id,
      userId: order.userId,
      provider,
      status: 'PENDING',
      amount: Number(order.totalAmount),
      isProxyPayment,
      proxyToken: proxyToken || null,
      providerOrderId: null,
    });
    return payment;
  }

  private async cancelPendingPayments(
    orderId: number,
    options: {
      provider?: string;
      isProxyPayment?: boolean;
      excludePaymentId?: number;
    } = {}
  ) {
    const query = this.mallPaymentEntity
      .createQueryBuilder()
      .update(MallPaymentEntity)
      .set({
        status: 'CANCELLED',
      })
      .where('orderId = :orderId', { orderId })
      .andWhere('status = :status', { status: 'PENDING' });

    if (options.provider) {
      query.andWhere('provider = :provider', { provider: options.provider });
    }

    if (options.isProxyPayment !== undefined) {
      query.andWhere('isProxyPayment = :isProxyPayment', {
        isProxyPayment: options.isProxyPayment,
      });
    }

    if (options.excludePaymentId) {
      query.andWhere('id != :excludePaymentId', {
        excludePaymentId: options.excludePaymentId,
      });
    }

    await query.execute();
  }

  private async findPaymentForPaypalCapture(
    paymentNo: string,
    paypalOrderId: string,
    options: {
      userId?: number;
      proxyToken?: string;
    } = {}
  ) {
    const payment = await this.mallPaymentEntity.findOneBy({
      paymentNo,
      provider: 'paypal',
    });
    if (!payment) {
      throw new CoolCommException('支付单不存在');
    }
    if (options.userId && payment.userId !== options.userId) {
      throw new CoolCommException('支付单不存在');
    }
    if (options.proxyToken && payment.proxyToken !== options.proxyToken) {
      throw new CoolCommException('支付单不存在');
    }
    if (payment.providerOrderId !== paypalOrderId) {
      throw new CoolCommException('PayPal 订单不匹配');
    }
    return payment;
  }

  async createPaymentByOrder(
    orderId: number,
    provider: string,
    userId: number
  ) {
    this.ensureProvider(provider);
    if (provider === 'paypal') {
      throw new CoolCommException('PayPal 请使用专用下单接口');
    }

    const order = await this.findOrderForUser(orderId, userId);
    const payment = await this.createPendingPayment(order, provider, false);

    return {
      paymentNo: payment.paymentNo,
      provider,
      amount: Number(order.totalAmount),
      checkoutUrl: this.buildCheckoutUrl(provider, payment.paymentNo),
    };
  }

  async createPaymentByProxyToken(proxyToken: string, provider: string) {
    this.ensureProvider(provider);
    if (provider === 'paypal') {
      throw new CoolCommException('PayPal 请使用专用下单接口');
    }

    const order = await this.findOrderForProxyToken(proxyToken);
    const payment = await this.createPendingPayment(
      order,
      provider,
      true,
      proxyToken
    );

    return {
      paymentNo: payment.paymentNo,
      provider,
      amount: Number(order.totalAmount),
      checkoutUrl: this.buildCheckoutUrl(provider, payment.paymentNo),
    };
  }

  async createPaypalOrderByOrder(orderId: number, userId: number) {
    const order = await this.findOrderForUser(orderId, userId);
    const payment = await this.createPendingPayment(order, 'paypal', false);
    const paypalOrder = await this.mallPaypalService.createOrder({
      paymentNo: payment.paymentNo,
      orderNo: order.orderNo,
      amount: Number(order.totalAmount),
    });

    await this.mallPaymentEntity.update(payment.id, {
      providerOrderId: paypalOrder.id,
      payload: paypalOrder as Record<string, any>,
    });

    return {
      paymentNo: payment.paymentNo,
      paypalOrderId: paypalOrder.id,
    };
  }

  async createPaypalOrderByProxyToken(proxyToken: string) {
    const order = await this.findOrderForProxyToken(proxyToken);
    const payment = await this.createPendingPayment(
      order,
      'paypal',
      true,
      proxyToken
    );
    const paypalOrder = await this.mallPaypalService.createOrder({
      paymentNo: payment.paymentNo,
      orderNo: order.orderNo,
      amount: Number(order.totalAmount),
    });

    await this.mallPaymentEntity.update(payment.id, {
      providerOrderId: paypalOrder.id,
      payload: paypalOrder as Record<string, any>,
    });

    return {
      paymentNo: payment.paymentNo,
      paypalOrderId: paypalOrder.id,
    };
  }

  async capturePaypalOrderByOrder(
    paymentNo: string,
    paypalOrderId: string,
    userId: number
  ) {
    const payment = await this.findPaymentForPaypalCapture(paymentNo, paypalOrderId, {
      userId,
    });

    if (payment.status === 'PAID') {
      const order = await this.mallOrderEntity.findOneBy({ id: payment.orderId });
      return {
        paymentNo: payment.paymentNo,
        orderNo: order?.orderNo,
        redirectUrl: this.buildResultUrl(
          'success',
          payment.paymentNo,
          order?.orderNo || '',
          payment.isProxyPayment
        ),
      };
    }

    const capture = await this.mallPaypalService.captureOrder({
      paymentNo,
      paypalOrderId,
    });
    if (!this.mallPaypalService.isCaptureCompleted(capture)) {
      throw new CoolCommException('PayPal 支付未完成');
    }

    return this.markPaidByPaymentNo(
      paymentNo,
      'paypal',
      capture,
      this.mallPaypalService.getCaptureId(capture)
    );
  }

  async capturePaypalOrderByProxyToken(
    proxyToken: string,
    paymentNo: string,
    paypalOrderId: string
  ) {
    const payment = await this.findPaymentForPaypalCapture(paymentNo, paypalOrderId, {
      proxyToken,
    });

    if (payment.status === 'PAID') {
      const order = await this.mallOrderEntity.findOneBy({ id: payment.orderId });
      return {
        paymentNo: payment.paymentNo,
        orderNo: order?.orderNo,
        redirectUrl: this.buildResultUrl(
          'success',
          payment.paymentNo,
          order?.orderNo || '',
          payment.isProxyPayment
        ),
      };
    }

    const capture = await this.mallPaypalService.captureOrder({
      paymentNo,
      paypalOrderId,
    });
    if (!this.mallPaypalService.isCaptureCompleted(capture)) {
      throw new CoolCommException('PayPal 支付未完成');
    }

    return this.markPaidByPaymentNo(
      paymentNo,
      'paypal',
      capture,
      this.mallPaypalService.getCaptureId(capture)
    );
  }

  async handlePaypalWebhook(
    event: Record<string, any>,
    headers: Record<string, any>
  ) {
    const verified = await this.mallPaypalService.verifyWebhook(headers, event);
    if (!verified) {
      throw new CoolCommException('PayPal webhook 验签失败');
    }

    if (event?.event_type !== 'PAYMENT.CAPTURE.COMPLETED') {
      return {
        received: true,
        ignored: true,
      };
    }

    const providerOrderId =
      event?.resource?.supplementary_data?.related_ids?.order_id;
    if (!providerOrderId) {
      return {
        received: true,
        ignored: true,
      };
    }

    const payment = await this.mallPaymentEntity.findOneBy({
      provider: 'paypal',
      providerOrderId,
    });

    if (!payment) {
      return {
        received: true,
        ignored: true,
      };
    }

    return this.markPaidByPaymentNo(
      payment.paymentNo,
      'paypal',
      event,
      event?.resource?.id
    );
  }

  @CoolTransaction({
    connectionName: 'default',
  })
  async markPaidByPaymentNo(
    paymentNo: string,
    provider: string,
    payload: Record<string, any> = {},
    transactionId?: string,
    queryRunner?: QueryRunner
  ) {
    const manager = queryRunner.manager;
    const payment = await manager.findOneBy(MallPaymentEntity, {
      paymentNo,
      provider,
    });
    if (!payment) {
      throw new CoolCommException('支付单不存在');
    }

    const order = await manager.findOneBy(MallOrderEntity, {
      id: payment.orderId,
    });
    if (!order) {
      throw new CoolCommException('订单不存在');
    }

    if (payment.status !== 'PAID') {
      await manager.update(MallPaymentEntity, payment.id, {
        status: 'PAID',
        transactionId: transactionId || paymentNo,
        payload,
        paidTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      });
    }

    if (order.status !== 'PAID') {
      await manager.update(MallOrderEntity, order.id, {
        status: 'PAID',
        paymentMethod: provider,
        paidTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      });
    }

    await manager
      .createQueryBuilder()
      .update(MallPaymentEntity)
      .set({
        status: 'CANCELLED',
      })
      .where('orderId = :orderId', { orderId: order.id })
      .andWhere('status = :status', { status: 'PENDING' })
      .andWhere('id != :paymentId', { paymentId: payment.id })
      .execute();

    return {
      paymentNo,
      orderNo: order.orderNo,
      redirectUrl: this.buildResultUrl(
        'success',
        paymentNo,
        order.orderNo,
        payment.isProxyPayment
      ),
    };
  }
}

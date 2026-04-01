import { Body, Inject, Post } from '@midwayjs/core';
import { BaseController, CoolController } from '@cool-midway/core';
import { MallOrderService } from '../../service/order';
import { MallPaymentService } from '../../service/payment';

/**
 * 结算
 */
@CoolController()
export class AppMallCheckoutController extends BaseController {
  @Inject()
  mallOrderService: MallOrderService;

  @Inject()
  mallPaymentService: MallPaymentService;

  @Inject()
  ctx;

  @Post('/submit', { summary: '提交订单' })
  async submit(@Body('addressId') addressId: number) {
    return this.ok(
      await this.mallOrderService.createOrder(this.ctx.user.id, Number(addressId))
    );
  }

  @Post('/pay', { summary: '创建支付单' })
  async pay(
    @Body('orderId') orderId: number,
    @Body('provider') provider: string
  ) {
    return this.ok(
      await this.mallPaymentService.createPaymentByOrder(
        Number(orderId),
        provider,
        this.ctx.user.id
      )
    );
  }

  @Post('/paypal/createOrder', { summary: 'PayPal 创建支付订单' })
  async paypalCreateOrder(@Body('orderId') orderId: number) {
    return this.ok(
      await this.mallPaymentService.createPaypalOrderByOrder(
        Number(orderId),
        this.ctx.user.id
      )
    );
  }

  @Post('/paypal/captureOrder', { summary: 'PayPal 捕获支付订单' })
  async paypalCaptureOrder(
    @Body('paymentNo') paymentNo: string,
    @Body('paypalOrderId') paypalOrderId: string
  ) {
    return this.ok(
      await this.mallPaymentService.capturePaypalOrderByOrder(
        paymentNo,
        paypalOrderId,
        this.ctx.user.id
      )
    );
  }
}

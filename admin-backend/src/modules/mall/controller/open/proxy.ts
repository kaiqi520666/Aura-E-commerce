import { Body, Get, Inject, Post, Query } from '@midwayjs/core';
import { BaseController, CoolController } from '@cool-midway/core';
import { MallOrderService } from '../../service/order';
import { MallPaymentService } from '../../service/payment';

/**
 * 代付
 */
@CoolController()
export class OpenMallProxyController extends BaseController {
  @Inject()
  mallOrderService: MallOrderService;

  @Inject()
  mallPaymentService: MallPaymentService;

  @Get('/detail', { summary: '代付详情' })
  async detail(@Query('token') token: string) {
    return this.ok(await this.mallOrderService.getProxyDetail(token));
  }

  @Post('/pay', { summary: '代付创建支付单' })
  async pay(@Body('token') token: string, @Body('provider') provider: string) {
    return this.ok(
      await this.mallPaymentService.createPaymentByProxyToken(token, provider)
    );
  }

  @Post('/paypal/createOrder', { summary: 'PayPal 代付创建订单' })
  async paypalCreateOrder(@Body('token') token: string) {
    return this.ok(
      await this.mallPaymentService.createPaypalOrderByProxyToken(token)
    );
  }

  @Post('/paypal/captureOrder', { summary: 'PayPal 代付捕获订单' })
  async paypalCaptureOrder(
    @Body('token') token: string,
    @Body('paymentNo') paymentNo: string,
    @Body('paypalOrderId') paypalOrderId: string
  ) {
    return this.ok(
      await this.mallPaymentService.capturePaypalOrderByProxyToken(
        token,
        paymentNo,
        paypalOrderId
      )
    );
  }
}

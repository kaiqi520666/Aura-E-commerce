import { Body, Get, Inject, Post, Query } from '@midwayjs/core';
import { BaseController, CoolController } from '@cool-midway/core';
import { MallPaymentService } from '../../service/payment';

/**
 * epusdt
 */
@CoolController()
export class OpenMallEpusdtController extends BaseController {
  @Inject()
  mallPaymentService: MallPaymentService;

  @Inject()
  ctx;

  @Get('/checkout', { summary: 'epusdt 模拟支付跳转' })
  async checkout(@Query('paymentNo') paymentNo: string) {
    const result = await this.mallPaymentService.markPaidByPaymentNo(
      paymentNo,
      'epusdt',
      { source: 'epusdt-checkout' },
      `epusdt-${paymentNo}`
    );
    this.ctx.redirect(result.redirectUrl);
  }

  @Post('/webhook', { summary: 'epusdt 回调' })
  async webhook(@Body() body) {
    return this.ok(
      await this.mallPaymentService.markPaidByPaymentNo(
        body.paymentNo,
        'epusdt',
        body,
        body.transactionId
      )
    );
  }
}

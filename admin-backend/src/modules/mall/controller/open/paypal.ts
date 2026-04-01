import { Body, Inject, Post } from '@midwayjs/core';
import { BaseController, CoolController } from '@cool-midway/core';
import { MallPaymentService } from '../../service/payment';

/**
 * PayPal
 */
@CoolController()
export class OpenMallPaypalController extends BaseController {
  @Inject()
  mallPaymentService: MallPaymentService;

  @Inject()
  ctx;

  @Post('/webhook', { summary: 'PayPal 回调' })
  async webhook(@Body() body) {
    return this.ok(
      await this.mallPaymentService.handlePaypalWebhook(body, this.ctx.headers)
    );
  }
}

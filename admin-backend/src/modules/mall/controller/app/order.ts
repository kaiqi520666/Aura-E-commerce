import { Body, Get, Inject, Post, Query } from '@midwayjs/core';
import { BaseController, CoolController } from '@cool-midway/core';
import { MallOrderService } from '../../service/order';

/**
 * 订单
 */
@CoolController()
export class AppMallOrderController extends BaseController {
  @Inject()
  mallOrderService: MallOrderService;

  @Inject()
  ctx;

  @Get('/page', { summary: '订单列表' })
  async userPage(@Query() query) {
    return this.ok(await this.mallOrderService.pageUser(this.ctx.user.id, query));
  }

  @Get('/detail', { summary: '订单详情' })
  async detailData(@Query('id') id: number) {
    return this.ok(await this.mallOrderService.detail(this.ctx.user.id, Number(id)));
  }

  @Post('/proxyLink', { summary: '生成代付链接' })
  async createProxy(@Body('orderId') orderId: number) {
    return this.ok(
      await this.mallOrderService.createProxyLink(this.ctx.user.id, Number(orderId))
    );
  }
}
import { Body, Get, Inject, Post } from '@midwayjs/core';
import { BaseController, CoolController } from '@cool-midway/core';
import { MallCartService } from '../../service/cart';

/**
 * 购物车
 */
@CoolController()
export class AppMallCartController extends BaseController {
  @Inject()
  mallCartService: MallCartService;

  @Inject()
  ctx;

  @Get('/list', { summary: '购物车列表' })
  async listData() {
    return this.ok(await this.mallCartService.listItems(this.ctx.user.id));
  }

  @Post('/add', { summary: '加入购物车' })
  async addItem(
    @Body('productId') productId: number,
    @Body('quantity') quantity: number
  ) {
    return this.ok(
      await this.mallCartService.addItem(
        this.ctx.user.id,
        Number(productId),
        Number(quantity || 1)
      )
    );
  }

  @Post('/updateQuantity', { summary: '更新数量' })
  async changeQuantity(
    @Body('id') id: number,
    @Body('quantity') quantity: number
  ) {
    return this.ok(
      await this.mallCartService.updateQuantity(
        this.ctx.user.id,
        Number(id),
        Number(quantity)
      )
    );
  }

  @Post('/remove', { summary: '移除购物车项' })
  async removeItem(@Body('id') id: number) {
    return this.ok(await this.mallCartService.removeItem(this.ctx.user.id, Number(id)));
  }

  @Post('/clear', { summary: '清空购物车' })
  async clearItems() {
    return this.ok(await this.mallCartService.clearCart(this.ctx.user.id));
  }
}
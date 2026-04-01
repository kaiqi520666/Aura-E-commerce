import { Get, Inject, Post, Body } from '@midwayjs/core';
import { BaseController, CoolController } from '@cool-midway/core';
import { MallFavoriteService } from '../../service/favorite';

/**
 * 收藏
 */
@CoolController()
export class AppMallFavoriteController extends BaseController {
  @Inject()
  mallFavoriteService: MallFavoriteService;

  @Inject()
  ctx;

  @Get('/list', { summary: '收藏列表' })
  async listData() {
    return this.ok(await this.mallFavoriteService.listItems(this.ctx.user.id));
  }

  @Get('/ids', { summary: '收藏ID集合' })
  async ids() {
    return this.ok(await this.mallFavoriteService.ids(this.ctx.user.id));
  }

  @Post('/toggle', { summary: '切换收藏状态' })
  async toggle(@Body('productId') productId: number) {
    return this.ok(
      await this.mallFavoriteService.toggle(this.ctx.user.id, Number(productId))
    );
  }
}
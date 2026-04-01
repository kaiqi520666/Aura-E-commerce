import { Body, Get, Inject, Post, Query } from '@midwayjs/core';
import {
  BaseController,
  CoolController,
  CoolTag,
  TagTypes,
} from '@cool-midway/core';
import { MallReviewService } from '../../service/review';

/**
 * 评论
 */
@CoolController()
export class AppMallReviewController extends BaseController {
  @Inject()
  mallReviewService: MallReviewService;

  @Inject()
  ctx;

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Get('/list', { summary: '评论列表' })
  async publicList(@Query('productId') productId: number) {
    return this.ok(await this.mallReviewService.listPublic(Number(productId)));
  }

  @Post('/add', { summary: '发表评论' })
  async addReview(@Body() body) {
    return this.ok(
      await this.mallReviewService.addReview(
        this.ctx.user.id,
        Number(body.productId),
        body
      )
    );
  }
}
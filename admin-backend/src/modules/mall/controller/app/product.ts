import { Get, Inject, Query } from '@midwayjs/core';
import {
  BaseController,
  CoolController,
  CoolTag,
  TagTypes,
} from '@cool-midway/core';
import { MallProductService } from '../../service/product';

/**
 * 商城商品
 */
@CoolController()
export class AppMallProductController extends BaseController {
  @Inject()
  mallProductService: MallProductService;

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Get('/home', { summary: '首页数据' })
  async homeData() {
    return this.ok(await this.mallProductService.home());
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Get('/page', { summary: '商品列表' })
  async publicPage(@Query() query) {
    return this.ok(await this.mallProductService.pagePublic(query));
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Get('/detail', { summary: '商品详情' })
  async detailData(@Query('id') id: number) {
    return this.ok(await this.mallProductService.detail(Number(id)));
  }
}
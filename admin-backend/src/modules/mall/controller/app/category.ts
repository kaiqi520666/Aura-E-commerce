import { Get, Inject } from '@midwayjs/core';
import {
  BaseController,
  CoolController,
  CoolTag,
  TagTypes,
} from '@cool-midway/core';
import { MallCategoryService } from '../../service/category';

/**
 * 商城分类
 */
@CoolController()
export class AppMallCategoryController extends BaseController {
  @Inject()
  mallCategoryService: MallCategoryService;

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Get('/list', { summary: '分类列表' })
  async listData() {
    return this.ok(await this.mallCategoryService.listPublic());
  }
}
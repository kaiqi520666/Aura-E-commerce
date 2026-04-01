import { CoolController, BaseController } from '@cool-midway/core';
import { MallCategoryEntity } from '../../entity/category';
import { MallCategoryService } from '../../service/category';

/**
 * 商城分类
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: MallCategoryEntity,
  service: MallCategoryService,
  pageQueryOp: {
    fieldEq: ['a.status'],
    fieldLike: ['a.slug'],
    keyWordLikeFields: ['a.name', 'a.description'],
    addOrderBy: {
      sortOrder: 'ASC',
      createTime: 'DESC',
    },
  },
})
export class AdminMallCategoryController extends BaseController {}

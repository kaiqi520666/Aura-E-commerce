import { CoolController, BaseController } from '@cool-midway/core';
import { MallProductEntity } from '../../entity/product';
import { MallProductService } from '../../service/product';

/**
 * 商城商品
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: MallProductEntity,
  service: MallProductService,
  pageQueryOp: {
    fieldEq: ['a.status', 'a.categoryId', 'a.featured', 'a.bestSeller'],
    fieldLike: ['a.slug'],
    keyWordLikeFields: ['a.name', 'a.subtitle', 'a.description'],
    addOrderBy: {
      createTime: 'DESC',
    },
  },
})
export class AdminMallProductController extends BaseController {}

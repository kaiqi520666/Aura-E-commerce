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
    keyWordLikeFields: ['a.name', 'a.description'],
    addOrderBy: {
      createTime: 'DESC',
    },
  },
})
export class AdminMallProductController extends BaseController {}

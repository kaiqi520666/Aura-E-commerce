import { CoolController, BaseController } from '@cool-midway/core';
import { MallReviewEntity } from '../../entity/review';
import { MallReviewService } from '../../service/review';

/**
 * 商城评论
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: MallReviewEntity,
  service: MallReviewService,
  pageQueryOp: {
    fieldEq: ['a.status', 'a.productId', 'a.rating'],
    keyWordLikeFields: ['a.userName', 'a.title', 'a.content'],
    addOrderBy: {
      createTime: 'DESC',
    },
  },
})
export class AdminMallReviewController extends BaseController {}

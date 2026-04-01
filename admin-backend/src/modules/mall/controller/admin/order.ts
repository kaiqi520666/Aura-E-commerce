import { CoolController, BaseController } from '@cool-midway/core';
import { MallOrderEntity } from '../../entity/order';
import { MallOrderService } from '../../service/order';

/**
 * 商城订单
 */
@CoolController({
  api: ['info', 'list', 'page', 'update'],
  entity: MallOrderEntity,
  service: MallOrderService,
  pageQueryOp: {
    fieldEq: ['a.status', 'a.userId', 'a.paymentMethod'],
    fieldLike: ['a.orderNo'],
    addOrderBy: {
      createTime: 'DESC',
    },
  },
})
export class AdminMallOrderController extends BaseController {}

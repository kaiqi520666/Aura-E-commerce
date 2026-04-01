import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 订单商品
 */
@Entity('mall_order_item')
export class MallOrderItemEntity extends BaseEntity {
  @Index()
  @Column({ comment: '订单ID' })
  orderId: number;

  @Index()
  @Column({ comment: '商品ID' })
  productId: number;

  @Column({ comment: '商品名称', length: 128 })
  productName: string;

  @Column({ comment: '商品图片', nullable: true, length: 255 })
  productImage: string;

  @Column({
    comment: '成交单价',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  price: number;

  @Column({ comment: '数量', default: 1 })
  quantity: number;

  @Column({
    comment: '行金额',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  lineTotal: number;
}

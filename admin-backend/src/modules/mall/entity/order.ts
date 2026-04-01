import { BaseEntity, transformerJson } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 订单
 */
@Entity('mall_order')
export class MallOrderEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ comment: '订单号', length: 32 })
  orderNo: string;

  @Index()
  @Column({ comment: '用户ID' })
  userId: number;

  @Column({ comment: '订单状态', length: 32, default: 'PENDING_PAYMENT' })
  status: string;

  @Column({
    comment: '商品总额',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  subtotalAmount: number;

  @Column({
    comment: '订单总额',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalAmount: number;

  @Column({ comment: '商品件数', default: 0 })
  itemCount: number;

  @Column({
    comment: '地址快照',
    type: 'json',
    nullable: true,
    transformer: transformerJson,
  })
  addressSnapshot: Record<string, any>;

  @Column({ comment: '支付方式', nullable: true, length: 32 })
  paymentMethod: string;

  @Index()
  @Column({ comment: '代付Token', nullable: true, length: 64 })
  proxyToken: string;

  @Column({ comment: '支付时间', nullable: true, length: 32 })
  paidTime: string;
}

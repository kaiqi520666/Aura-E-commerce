import { BaseEntity, transformerJson } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 支付记录
 */
@Entity('mall_payment')
export class MallPaymentEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ comment: '支付单号', length: 32 })
  paymentNo: string;

  @Index()
  @Column({ comment: '订单ID' })
  orderId: number;

  @Index()
  @Column({ comment: '用户ID', nullable: true })
  userId: number;

  @Column({ comment: '支付渠道', length: 32 })
  provider: string;

  @Column({ comment: '支付状态', length: 32, default: 'PENDING' })
  status: string;

  @Index()
  @Column({ comment: '三方订单号', nullable: true, length: 64 })
  providerOrderId: string;

  @Column({
    comment: '支付金额',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  amount: number;

  @Column({ comment: '是否代付', default: false })
  isProxyPayment: boolean;

  @Column({ comment: '代付Token', nullable: true, length: 64 })
  proxyToken: string;

  @Column({ comment: '三方流水号', nullable: true, length: 128 })
  transactionId: string;

  @Column({
    comment: '回调载荷',
    type: 'json',
    nullable: true,
    transformer: transformerJson,
  })
  payload: Record<string, any>;

  @Column({ comment: '支付时间', nullable: true, length: 32 })
  paidTime: string;
}

import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 购物车项
 */
@Entity('mall_cart_item')
@Index(['userId', 'productId'], { unique: true })
export class MallCartItemEntity extends BaseEntity {
  @Index()
  @Column({ comment: '用户ID' })
  userId: number;

  @Index()
  @Column({ comment: '商品ID' })
  productId: number;

  @Column({ comment: '数量', default: 1 })
  quantity: number;
}

import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 商品评论
 */
@Entity('mall_review')
@Index(['userId', 'productId'], { unique: true })
export class MallReviewEntity extends BaseEntity {
  @Index()
  @Column({ comment: '商品ID' })
  productId: number;

  @Index()
  @Column({ comment: '用户ID' })
  userId: number;

  @Column({ comment: '用户昵称', length: 128 })
  userName: string;

  @Column({ comment: '评分', default: 5 })
  rating: number;

  @Column({ comment: '评论标题', nullable: true, length: 128 })
  title: string;

  @Column({ comment: '评论内容', type: 'text' })
  content: string;

  @Column({ comment: '状态 0-隐藏 1-显示', default: 1 })
  status: number;
}

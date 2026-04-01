import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 商城分类
 */
@Entity('mall_category')
export class MallCategoryEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ comment: '分类标识', length: 64 })
  slug: string;

  @Column({ comment: '分类名称', length: 64 })
  name: string;

  @Column({ comment: '分类描述', nullable: true, length: 255 })
  description: string;

  @Column({ comment: '分类图片', nullable: true, length: 255 })
  image: string;

  @Column({ comment: '排序', default: 0 })
  sortOrder: number;

  @Column({ comment: '状态 0-禁用 1-启用', default: 1 })
  status: number;
}

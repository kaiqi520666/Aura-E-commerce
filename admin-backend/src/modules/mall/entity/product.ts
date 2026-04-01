import { BaseEntity, transformerJson } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 商城商品
 */
@Entity('mall_product')
export class MallProductEntity extends BaseEntity {
  @Index()
  @Column({ comment: '分类ID' })
  categoryId: number;

  @Column({ comment: '商品名称', length: 128 })
  name: string;

  @Column({ comment: '商品描述', type: 'text', nullable: true })
  description: string;

  @Column({ comment: '主图', nullable: true, length: 255 })
  mainImage: string;

  @Column({
    comment: '商品图集',
    type: 'json',
    nullable: true,
    transformer: transformerJson,
  })
  gallery: string[];

  @Column({
    comment: '价格',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  price: number;

  @Column({
    comment: '划线价',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  comparePrice: number;

  @Column({ comment: '库存', default: 0 })
  stock: number;

  @Column({
    comment: '状态',
    default: 1,
    dict: ['禁用', '启用'],
    type: 'tinyint',
  })
  status: number;

  @Column({
    comment: '是否精选',
    default: false,
    dict: ['否', '是'],
    type: 'tinyint',
  })
  featured: number;

  @Column({
    comment: '是否热卖',
    default: false,
    dict: ['否', '是'],
    type: 'tinyint',
  })
  bestSeller: number;

  @Column({
    comment: '评分',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
  })
  rating: number;

  @Column({ comment: '评论数', default: 0 })
  reviewCount: number;
}

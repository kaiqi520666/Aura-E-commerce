import { BaseEntity } from '../../base/entity/base';
import { Entity, Column, Index } from 'typeorm';

/**
 * 用户模块-收货地址
 */
@Entity('user_address')
export class UserAddressEntity extends BaseEntity {
  @Index()
  @Column({ comment: '用户ID' })
  userId: number;

  @Column({ comment: '名' })
  firstName: string;

  @Column({ comment: '姓', nullable: true })
  lastName: string;

  @Index()
  @Column({ comment: '手机号', length: 32 })
  phone: string;

  @Column({ comment: '国家' })
  country: string;

  @Column({ comment: '州/省' })
  state: string;

  @Column({ comment: '城市' })
  city: string;

  @Column({ comment: '邮编', nullable: true })
  postalCode: string;

  @Column({ comment: '地址1' })
  addressLine1: string;

  @Column({ comment: '地址2', nullable: true })
  addressLine2: string;

  @Column({ comment: '是否默认', default: false })
  isDefault: boolean;
}

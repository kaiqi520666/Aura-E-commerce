import * as crypto from 'crypto';
import * as moment from 'moment';
import { Init, Provide } from '@midwayjs/core';
import {
  BaseService,
  CoolCommException,
  CoolTransaction,
} from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { In, QueryRunner, Repository } from 'typeorm';
import { MallOrderEntity } from '../entity/order';
import { MallOrderItemEntity } from '../entity/order-item';
import { MallCartItemEntity } from '../entity/cart-item';
import { MallProductEntity } from '../entity/product';
import { UserAddressEntity } from '../../user/entity/address';
import { UserInfoEntity } from '../../user/entity/info';
import { MallReviewEntity } from '../entity/review';

/**
 * 订单
 */
@Provide()
export class MallOrderService extends BaseService {
  @InjectEntityModel(MallOrderEntity)
  mallOrderEntity: Repository<MallOrderEntity>;

  @InjectEntityModel(MallOrderItemEntity)
  mallOrderItemEntity: Repository<MallOrderItemEntity>;

  @InjectEntityModel(MallCartItemEntity)
  mallCartItemEntity: Repository<MallCartItemEntity>;

  @InjectEntityModel(MallProductEntity)
  mallProductEntity: Repository<MallProductEntity>;

  @InjectEntityModel(UserAddressEntity)
  userAddressEntity: Repository<UserAddressEntity>;

  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  @InjectEntityModel(MallReviewEntity)
  mallReviewEntity: Repository<MallReviewEntity>;

  @Init()
  async init() {
    await super.init();
    this.setEntity(this.mallOrderEntity);
  }

  private createOrderNo() {
    return `AURA${moment().format('YYYYMMDDHHmmss')}${Math.floor(
      Math.random() * 9000 + 1000
    )}`;
  }

  private maskDisplayName(name?: string) {
    const value = String(name || '').trim();
    if (!value) return 'A***a';
    if (value.length <= 1) return `${value}***`;
    if (value.length === 2) return `${value[0]}*`;
    return `${value[0]}${'*'.repeat(Math.min(3, value.length - 2))}${value[value.length - 1]}`;
  }

  @CoolTransaction({
    connectionName: 'default',
  })
  async createOrder(
    userId: number,
    addressId: number,
    queryRunner?: QueryRunner
  ) {
    const manager = queryRunner.manager;
    const address = await manager.findOneBy(UserAddressEntity, {
      id: addressId,
      userId,
    });
    if (!address) {
      throw new CoolCommException('地址不存在');
    }

    const cartItems = await manager.findBy(MallCartItemEntity, { userId });
    if (!cartItems.length) {
      throw new CoolCommException('购物车为空');
    }

    const products = await manager.findBy(MallProductEntity, {
      id: In(cartItems.map(item => item.productId)),
      status: 1,
    });

    if (products.length !== cartItems.length) {
      throw new CoolCommException('存在不可下单的商品');
    }

    let subtotalAmount = 0;
    let itemCount = 0;
    const productMap = new Map(products.map(item => [item.id, item]));

    const order = await manager.save(MallOrderEntity, {
      userId,
      orderNo: this.createOrderNo(),
      status: 'PENDING_PAYMENT',
      addressSnapshot: {
        firstName: address.firstName,
        lastName: address.lastName,
        phone: address.phone,
        country: address.country,
        state: address.state,
        city: address.city,
        postalCode: address.postalCode,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
      },
      subtotalAmount: 0,
      totalAmount: 0,
      itemCount: 0,
    });

    for (const cartItem of cartItems) {
      const product = productMap.get(cartItem.productId);
      if (!product || product.stock < cartItem.quantity) {
        throw new CoolCommException('库存不足');
      }

      const lineTotal = Number(product.price) * cartItem.quantity;
      subtotalAmount += lineTotal;
      itemCount += cartItem.quantity;

      await manager.save(MallOrderItemEntity, {
        orderId: order.id,
        productId: product.id,
        productName: product.name,
        productImage: product.mainImage,
        price: Number(product.price),
        quantity: cartItem.quantity,
        lineTotal,
      });
    }

    await manager.update(MallOrderEntity, order.id, {
      subtotalAmount,
      totalAmount: subtotalAmount,
      itemCount,
    });

    await manager.delete(MallCartItemEntity, { userId });

    const savedOrder = await manager.findOneBy(MallOrderEntity, {
      id: order.id,
      userId,
    });
    const items = await manager.find(MallOrderItemEntity, {
      where: { orderId: order.id },
      order: { id: 'ASC' },
    });

    return {
      ...savedOrder,
      items,
    };
  }

  async pageUser(userId: number, query) {
    const page = Math.max(Number(query.page || 1), 1);
    const size = Math.max(Number(query.size || 10), 1);
    const find = this.mallOrderEntity
      .createQueryBuilder('a')
      .where('a.userId = :userId', { userId });

    if (query.status) {
      find.andWhere('a.status = :status', { status: query.status });
    }

    find
      .orderBy('a.createTime', 'DESC')
      .skip((page - 1) * size)
      .take(size);
    const [list, total] = await find.getManyAndCount();

    return {
      list,
      pagination: {
        page,
        size,
        total,
      },
    };
  }

  async detail(userId: number, id: number) {
    const order = await this.mallOrderEntity.findOneBy({ id, userId });
    if (!order) {
      throw new CoolCommException('订单不存在');
    }
    const items = await this.mallOrderItemEntity.find({
      where: { orderId: order.id },
      order: { id: 'ASC' },
    });
    return {
      ...order,
      items,
    };
  }

  async createProxyLink(userId: number, orderId: number) {
    const order = await this.mallOrderEntity.findOneBy({ id: orderId, userId });
    if (!order) {
      throw new CoolCommException('订单不存在');
    }
    if (order.status !== 'PENDING_PAYMENT') {
      throw new CoolCommException('只有待支付订单可创建代付链接');
    }
    const proxyToken = crypto.randomBytes(24).toString('hex');
    await this.mallOrderEntity.update(order.id, { proxyToken });

    return {
      proxyToken,
      proxyUrl: `/proxy-payment/${proxyToken}`,
    };
  }

  async getProxyDetail(proxyToken: string) {
    const order = await this.mallOrderEntity.findOneBy({ proxyToken });
    if (!order) {
      throw new CoolCommException('代付链接不存在');
    }
    const user = await this.userInfoEntity.findOneBy({ id: order.userId });
    const items = await this.mallOrderItemEntity.find({
      where: { orderId: order.id },
      order: { id: 'ASC' },
    });
    const reviews = await this.mallReviewEntity.find({
      where: { productId: In(items.map(item => item.productId)), status: 1 },
      order: { createTime: 'DESC' },
      take: 6,
    });

    return {
      ...order,
      items,
      owner: {
        avatarUrl: user?.avatarUrl || '',
        displayName: this.maskDisplayName(user?.nickName || user?.email),
      },
      reviewPreview: reviews,
      canPay: order.status === 'PENDING_PAYMENT',
    };
  }
}

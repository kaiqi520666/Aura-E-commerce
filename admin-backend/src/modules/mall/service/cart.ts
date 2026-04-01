import { Provide } from '@midwayjs/core';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MallCartItemEntity } from '../entity/cart-item';
import { MallProductEntity } from '../entity/product';

/**
 * Shopping cart
 */
@Provide()
export class MallCartService extends BaseService {
  @InjectEntityModel(MallCartItemEntity)
  mallCartItemEntity: Repository<MallCartItemEntity>;

  @InjectEntityModel(MallProductEntity)
  mallProductEntity: Repository<MallProductEntity>;

  async listItems(userId: number) {
    const items = await this.mallCartItemEntity
      .createQueryBuilder('a')
      .leftJoinAndMapOne(
        'a.product',
        MallProductEntity,
        'b',
        'a.productId = b.id'
      )
      .where('a.userId = :userId', { userId })
      .orderBy('a.createTime', 'DESC')
      .getMany();

    const normalizedItems = items
      .filter(item => item['product'])
      .map(item => {
        const product = item['product'] as MallProductEntity;
        const lineTotal = Number(product.price) * item.quantity;
        return {
          ...item,
          lineTotal,
        };
      });

    return {
      list: normalizedItems,
      summary: {
        quantity: normalizedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: normalizedItems.reduce(
          (sum, item) => sum + item.lineTotal,
          0
        ),
      },
    };
  }

  async addItem(userId: number, productId: number, quantity = 1) {
    const product = await this.mallProductEntity.findOneBy({
      id: productId,
      status: 1,
    });
    if (!product) {
      throw new CoolCommException('商品不存在');
    }
    if (product.stock < quantity) {
      throw new CoolCommException('库存不足');
    }

    const exists = await this.mallCartItemEntity.findOneBy({
      userId,
      productId,
    });
    if (exists) {
      const nextQuantity = exists.quantity + quantity;
      if (product.stock < nextQuantity) {
        throw new CoolCommException('库存不足');
      }
      await this.mallCartItemEntity.update(exists.id, {
        quantity: nextQuantity,
      });
    } else {
      await this.mallCartItemEntity.save({ userId, productId, quantity });
    }

    return this.listItems(userId);
  }

  async updateQuantity(userId: number, id: number, quantity: number) {
    const item = await this.mallCartItemEntity.findOneBy({ id, userId });
    if (!item) {
      throw new CoolCommException('购物车项不存在');
    }

    const product = await this.mallProductEntity.findOneBy({
      id: item.productId,
      status: 1,
    });
    if (!product) {
      throw new CoolCommException('商品不存在');
    }
    if (quantity < 1) {
      throw new CoolCommException('商品数量必须大于 0');
    }
    if (product.stock < quantity) {
      throw new CoolCommException('库存不足');
    }

    await this.mallCartItemEntity.update(id, { quantity });
    return this.listItems(userId);
  }

  async removeItem(userId: number, id: number) {
    await this.mallCartItemEntity.delete({ id, userId });
    return this.listItems(userId);
  }

  async clearCart(userId: number) {
    await this.mallCartItemEntity.delete({ userId });
    return this.listItems(userId);
  }
}

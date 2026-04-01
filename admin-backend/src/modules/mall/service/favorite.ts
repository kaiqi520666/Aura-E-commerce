import { Provide } from '@midwayjs/core';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MallFavoriteEntity } from '../entity/favorite';
import { MallProductEntity } from '../entity/product';

/**
 * 收藏
 */
@Provide()
export class MallFavoriteService extends BaseService {
  @InjectEntityModel(MallFavoriteEntity)
  mallFavoriteEntity: Repository<MallFavoriteEntity>;

  @InjectEntityModel(MallProductEntity)
  mallProductEntity: Repository<MallProductEntity>;

  async listItems(userId: number) {
    return this.mallFavoriteEntity
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
  }

  async ids(userId: number) {
    const favorites = await this.mallFavoriteEntity.findBy({ userId });
    return favorites.map(item => item.productId);
  }

  async toggle(userId: number, productId: number) {
    const product = await this.mallProductEntity.findOneBy({
      id: productId,
      status: 1,
    });
    if (!product) {
      throw new CoolCommException('商品不存在');
    }

    const exists = await this.mallFavoriteEntity.findOneBy({
      userId,
      productId,
    });
    if (exists) {
      await this.mallFavoriteEntity.delete({ id: exists.id });
      return { active: false };
    }

    await this.mallFavoriteEntity.save({ userId, productId });
    return { active: true };
  }
}

import { Init, Provide } from '@midwayjs/core';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MallReviewEntity } from '../entity/review';
import { MallProductEntity } from '../entity/product';
import { UserInfoEntity } from '../../user/entity/info';

/**
 * 商品评论
 */
@Provide()
export class MallReviewService extends BaseService {
  @InjectEntityModel(MallReviewEntity)
  mallReviewEntity: Repository<MallReviewEntity>;

  @InjectEntityModel(MallProductEntity)
  mallProductEntity: Repository<MallProductEntity>;

  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  @Init()
  async init() {
    await super.init();
    this.setEntity(this.mallReviewEntity);
  }

  async listPublic(productId: number, limit = 20) {
    return this.mallReviewEntity.find({
      where: { productId, status: 1 },
      order: { createTime: 'DESC' },
      take: limit,
    });
  }

  async addReview(
    userId: number,
    productId: number,
    payload: { rating: number; title?: string; content: string }
  ) {
    const product = await this.mallProductEntity.findOneBy({
      id: productId,
      status: 1,
    });
    if (!product) {
      throw new CoolCommException('商品不存在');
    }

    const user = await this.userInfoEntity.findOneBy({ id: userId, status: 1 });
    if (!user) {
      throw new CoolCommException('用户不存在');
    }

    const rating = Math.min(Math.max(Number(payload.rating || 5), 1), 5);
    const content = String(payload.content || '').trim();
    if (!content) {
      throw new CoolCommException('评论内容不能为空');
    }

    const exists = await this.mallReviewEntity.findOneBy({ userId, productId });
    if (exists) {
      await this.mallReviewEntity.update(exists.id, {
        rating,
        title: payload.title,
        content,
        status: 1,
        userName: user.nickName || user.email,
      });
    } else {
      await this.mallReviewEntity.save({
        userId,
        productId,
        rating,
        title: payload.title,
        content,
        status: 1,
        userName: user.nickName || user.email,
      });
    }

    await this.refreshProductStats(productId);
    return this.listPublic(productId);
  }

  async refreshProductStats(productId: number) {
    const reviews = await this.mallReviewEntity.findBy({
      productId,
      status: 1,
    });
    const reviewCount = reviews.length;
    const rating = reviewCount
      ? reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
        reviewCount
      : 0;

    await this.mallProductEntity.update(productId, {
      reviewCount,
      rating: Number(rating.toFixed(2)),
    });
  }
}

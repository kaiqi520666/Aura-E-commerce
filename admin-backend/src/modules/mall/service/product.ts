import { Init, Provide } from '@midwayjs/core';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MallProductEntity } from '../entity/product';
import { MallCategoryEntity } from '../entity/category';

/**
 * 商城商品
 */
@Provide()
export class MallProductService extends BaseService {
  @InjectEntityModel(MallProductEntity)
  mallProductEntity: Repository<MallProductEntity>;

  @InjectEntityModel(MallCategoryEntity)
  mallCategoryEntity: Repository<MallCategoryEntity>;

  @Init()
  async init() {
    await super.init();
    this.setEntity(this.mallProductEntity);
  }

  async home() {
    const [categories, bestSellers, featured] = await Promise.all([
      this.mallCategoryEntity.find({
        where: { status: 1 },
        order: { sortOrder: 'ASC', createTime: 'DESC' },
        take: 4,
      }),
      this.mallProductEntity.find({
        where: { status: 1, bestSeller: 1 },
        order: { createTime: 'DESC' },
        take: 4,
      }),
      this.mallProductEntity.find({
        where: { status: 1, featured: 1 },
        order: { createTime: 'DESC' },
        take: 8,
      }),
    ]);

    return {
      categories,
      bestSellers,
      featuredProducts: featured,
    };
  }

  async pagePublic(query) {
    const page = Math.max(Number(query.page || 1), 1);
    const size = Math.max(Number(query.size || 12), 1);
    const find = this.mallProductEntity
      .createQueryBuilder('a')
      .leftJoinAndMapOne(
        'a.category',
        MallCategoryEntity,
        'b',
        'a.categoryId = b.id'
      )
      .where('a.status = :status', { status: 1 });

    if (query.keyword) {
      find.andWhere('(a.name LIKE :keyword OR a.description LIKE :keyword)', {
        keyword: `%${query.keyword}%`,
      });
    }

    if (query.categoryId) {
      find.andWhere('a.categoryId = :categoryId', {
        categoryId: Number(query.categoryId),
      });
    }

    if (query.categorySlug) {
      find.andWhere('b.slug = :categorySlug', {
        categorySlug: query.categorySlug,
      });
    }

    if (query.minPrice) {
      find.andWhere('a.price >= :minPrice', {
        minPrice: Number(query.minPrice),
      });
    }

    if (query.maxPrice) {
      find.andWhere('a.price <= :maxPrice', {
        maxPrice: Number(query.maxPrice),
      });
    }

    switch (query.sort) {
      case 'priceAsc':
        find.orderBy('a.price', 'ASC');
        break;
      case 'priceDesc':
        find.orderBy('a.price', 'DESC');
        break;
      default:
        find.orderBy('a.createTime', 'DESC');
        break;
    }

    find.skip((page - 1) * size).take(size);
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

  async detail(id: number) {
    const product = await this.mallProductEntity
      .createQueryBuilder('a')
      .leftJoinAndMapOne(
        'a.category',
        MallCategoryEntity,
        'b',
        'a.categoryId = b.id'
      )
      .where('a.id = :id', { id })
      .andWhere('a.status = :status', { status: 1 })
      .getOne();

    if (!product) {
      throw new CoolCommException('商品不存在');
    }

    const relatedProducts = await this.mallProductEntity.find({
      where: { status: 1, categoryId: product.categoryId },
      order: { createTime: 'DESC' },
      take: 4,
    });

    return {
      ...product,
      relatedProducts: relatedProducts.filter(item => item.id !== product.id),
    };
  }
}

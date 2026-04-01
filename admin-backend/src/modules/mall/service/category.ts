import { Init, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MallCategoryEntity } from '../entity/category';

/**
 * 商城分类
 */
@Provide()
export class MallCategoryService extends BaseService {
  @InjectEntityModel(MallCategoryEntity)
  mallCategoryEntity: Repository<MallCategoryEntity>;

  @Init()
  async init() {
    await super.init();
    this.setEntity(this.mallCategoryEntity);
  }

  async listPublic() {
    return this.mallCategoryEntity.find({
      where: { status: 1 },
      order: { sortOrder: 'ASC', createTime: 'DESC' },
    });
  }
}

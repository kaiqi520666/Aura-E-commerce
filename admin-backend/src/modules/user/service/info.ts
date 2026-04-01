import { BaseService, CoolCommException } from '@cool-midway/core';
import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import * as md5 from 'md5';
import { Equal, Repository } from 'typeorm';
import { UserInfoEntity } from '../entity/info';

/**
 * 用户信息
 */
@Provide()
export class UserInfoService extends BaseService {
  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  /**
   * 获取用户信息
   * @param id
   * @returns
   */
  async person(id) {
    const info = await this.userInfoEntity.findOneBy({ id: Equal(id) });
    if (!info) {
      return null;
    }
    delete info.password;
    return info;
  }

  /**
   * 注销
   * @param userId
   */
  async logoff(userId: number) {
    await this.userInfoEntity.update(
      { id: userId },
      {
        status: 2,
        phone: null,
        email: null,
        nickName: `已注销-00${userId}`,
        avatarUrl: null,
      }
    );
  }

  /**
   * 更新用户信息
   * @param id
   * @param param
   * @returns
   */
  async updatePerson(id, param) {
    const info = await this.person(id);
    if (!info) throw new CoolCommException('用户不存在');

    const allowFields = ['phone', 'avatarUrl', 'description'];
    const payload = {};

    for (const field of allowFields) {
      if (Object.prototype.hasOwnProperty.call(param, field)) {
        payload[field] = param[field];
      }
    }

    if (Object.keys(payload).length === 0) {
      return true;
    }

    try {
      return await this.userInfoEntity.update({ id }, payload);
    } catch (err) {
      throw new CoolCommException('更新失败');
    }
  }

  /**
   * 更新密码
   * @param userId
   * @param oldPassword
   * @param newPassword
   */
  async updatePassword(userId, oldPassword, newPassword) {
    const user = await this.userInfoEntity.findOneBy({ id: userId });
    if (!user) {
      throw new CoolCommException('用户不存在');
    }
    if (user.password !== md5(oldPassword)) {
      throw new CoolCommException('原密码错误');
    }
    await this.userInfoEntity.update(user.id, { password: md5(newPassword) });
  }
}

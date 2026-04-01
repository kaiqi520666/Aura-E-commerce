import {
  CoolController,
  BaseController,
  CoolUrlTag,
  TagTypes,
  CoolTag,
} from '@cool-midway/core';
import { Body, Inject, Post } from '@midwayjs/core';
import { UserLoginService } from '../../service/login';

/**
 * 登录
 */
@CoolUrlTag()
@CoolController()
export class AppUserLoginController extends BaseController {
  @Inject()
  userLoginService: UserLoginService;

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/register', { summary: '注册' })
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('nickName') nickName: string
  ) {
    return this.ok(
      await this.userLoginService.register(email, password, nickName)
    );
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/refreshToken', { summary: '刷新token' })
  public async refreshToken(@Body('refreshToken') refreshToken) {
    return this.ok(await this.userLoginService.refreshToken(refreshToken));
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/password', { summary: '密码登录' })
  async password(
    @Body('email') email: string,
    @Body('password') password: string
  ) {
    return this.ok(await this.userLoginService.password(email, password));
  }
}

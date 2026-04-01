# Aesthetic-E-commerce 项目记忆

## 项目定位

这是一个前后端分离的电商项目，当前业务主题不是通用百货，而是偏轻奢审美的 H5 商城，商品集中在以下四类：

- Lip
- Fragrance
- Jewelry
- Bags

前台目标是移动端/H5 购物体验，强调视觉氛围、礼赠感和轻内容化展示；后台目标是支撑商品、分类、购物车、收藏、下单、评论、支付和代付链路。

当前仓库不是单一应用，而是三个需要按职责理解的子项目：

- `h5-aura`：Vue 3 + Vite 的商城前台
- `admin-backend`：cool-admin-midway 的 Node.js/TypeScript 后端
- `web-admin`：Vue 3 + cool-admin-vue 的后台管理前端

## 仓库结构

### `h5-aura`

前端商城，核心目录如下：

- `src/main.js`：应用入口，挂载 Pinia、持久化插件、Vue Router
- `src/App.vue`：全局壳层，统一头部、主内容、底部
- `src/router/index.js`：前台路由和登录拦截
- `src/lib/api.js`：Axios 实例、token 读写、响应拦截
- `src/lib/shop.js`：商城业务 API 封装，前端应优先从这里接接口
- `src/stores`：Pinia 状态，当前主要有 `user`、`cart`、`favorite`
- `src/views`：页面级视图
- `src/components`：当前以布局组件和商品卡片组件为主
- `src/data/content.js`：前台接口失败时使用的兜底假数据和内容素材
- `src/assets/main.css`：全局视觉变量、字体、基础组件样式

### `admin-backend`

后端服务，基于 cool-admin-midway，核心目录如下：

- `src/config`：环境配置
- `src/config/config.default.ts`：服务端口、静态资源、缓存、cool 基础配置
- `src/config/config.local.ts`：本地 MySQL 配置，数据库名当前为 `aura`
- `src/modules`：模块化业务目录
- `src/modules/mall`：商城主业务模块
- `src/modules/user`：商城前台用户模块
- `src/modules/base`、`dict`、`plugin`、`recycle`、`space`、`swagger`、`task`、`demo`：框架基础能力或示例模块

### `web-admin`

后台管理端，主要用于维护商品、分类、订单、评论等后台数据，核心目录如下：

- `src/modules`：按模块划分的后台页面
- `src/modules/mall/views`：商城后台页面，商品/分类等管理界面在这里
- `build/cool`：cool 生成的 eps/service 元数据

## 前端业务结论

### 当前前台不是纯展示站

`h5-aura` 已经接入商城流程，不应被误判为单纯的视觉落地页。已存在的主要页面包括：

- 首页 `HomeView`
- 商品列表 `CatalogView`
- 商品详情 `ProductDetailView`
- 购物车 `CartView`
- 结算页 `CheckoutView`
- 支付结果 `PaymentResultView`
- 登录注册 `AuthView`
- 账户中心 `AccountView`
- 订单列表 `OrdersView`
- 订单详情 `OrderDetailView`
- 收藏夹 `FavoritesView`
- 政策页 `PolicyView`
- 代付页 `ProxyPaymentView`

### 当前前台的核心特征

- 使用 `Vue 3 + Vue Router + Pinia + Tailwind CSS 4`
- 视觉风格偏 editorial / soft luxe，不是后台风，也不是标准 SaaS 风
- `router.beforeEach` 通过 `mall_token` 判断登录态
- `user` store 会持久化 token、refresh token、profile、addresses
- `cart` 和 `favorite` 依赖后端接口，不做本地持久化
- 首页、分类、商品详情、评论在接口失败时会回退到 `src/data/content.js` 的假数据
- Vite 开发代理把 `/api` 转发到 `http://localhost:8001`

### 前端关键接口映射

`src/lib/shop.js` 已经约定好与后端的接口关系，后续新增前台业务时应优先延续这层封装，不要在页面里散落 `axios` 调用。

关键链路如下：

- 商品首页：`GET /app/mall/product/home`
- 分类列表：`GET /app/mall/category/list`
- 商品分页：`GET /app/mall/product/page`
- 商品详情：`GET /app/mall/product/detail`
- 评论列表：`GET /app/mall/review/list`
- 用户注册/登录/刷新 token：`/app/user/login/*`
- 账户信息与地址：`/app/user/info/*`、`/app/user/address/*`
- 购物车：`/app/mall/cart/*`
- 收藏：`/app/mall/favorite/*`
- 下单与支付：`/app/mall/checkout/*`
- 订单：`/app/mall/order/*`
- 代付详情与代付支付：`/open/mall/proxy/*`

## 后端业务结论

### 当前真正的业务模块

虽然后端带有 cool-admin 的基础模块，但和本仓库电商业务直接相关的主要是：

- `src/modules/mall`
- `src/modules/user`

后续如果要改商城核心流程，优先查看这两个模块，而不是把精力放在 `demo` 或框架基础模块上。

### `mall` 模块职责

`mall` 模块已经具备一条完整的商城交易主链路，核心实体包括：

- `mall_category`
- `mall_product`
- `mall_cart_item`
- `mall_favorite`
- `mall_order`
- `mall_order_item`
- `mall_payment`
- `mall_review`

核心能力包括：

- 商品首页聚合、列表、详情
- 分类列表
- 购物车增删改查
- 收藏切换与收藏列表
- 下单生成订单
- 订单分页、详情、代付链接
- 评论列表与评论新增
- 支付单生成
- PayPal / epusdt 两种支付方式
- 朋友代付

### `user` 模块职责

`user` 模块是商城前台用户系统，不是 admin 账号体系，当前主要包含：

- 邮箱注册
- 邮箱密码登录
- refresh token 刷新
- 用户资料查询/修改
- 密码修改
- 收货地址管理

认证依赖 JWT，中间件在 `src/modules/user/middleware/app.ts` 中全局挂载给该模块。

### 后端当前的重要实现事实

- 本地默认端口是 `8001`
- 本地开发数据库当前使用 MySQL，数据库名为 `aura`
- `config.local.ts` 开启了 `synchronize: true`，仅适合本地开发
- `config.prod.ts` 已关闭 `synchronize`
- `src/modules/mall/db.json` 已提供商城初始化数据
- 支付流程当前是“模拟支付跳转 + 回调更新订单状态”的实现，不是正式第三方 SDK 深度接入

## 关键业务链路

### 1. 用户购买链路

前端流程：

1. 浏览首页/分类/商品详情
2. 登录或注册
3. 加入购物车
4. 选择地址并提交订单
5. 选择 `paypal` 或 `epusdt`
6. 跳转支付
7. 回到支付结果页

后端对应：

1. `MallProductService` 提供首页、列表、详情
2. `MallCartService` 管购物车
3. `MallOrderService.createOrder()` 生成订单并清空购物车
4. `MallPaymentService.createPaymentByOrder()` 生成支付单
5. `OpenMallPaypalController` / `OpenMallEpusdtController` 模拟支付成功
6. `MallPaymentService.markPaidByPaymentNo()` 更新支付单和订单状态

### 2. 代付链路

这是当前项目一个明确存在的特色功能，不要在后续上下文里遗漏。

流程如下：

1. 用户对待支付订单生成代付链接
2. 前端访问 `/proxy-payment/:token`
3. 访客查看锁定的订单摘要和评论预览
4. 访客选择支付方式发起代付
5. 支付成功后订单被标记为已支付

后端关键入口：

- `POST /app/mall/order/proxyLink`
- `GET /open/mall/proxy/detail`
- `POST /open/mall/proxy/pay`

## 运行与联调记忆

本仓库应按“双服务”理解，开发时通常需要同时启动：

- 前端：`h5-aura` -> `npm run dev`
- 后端：`admin-backend` -> `npm run dev`

本地联调关系：

- 前端默认端口：`5173`
- 后端默认端口：`8001`
- 前端通过 Vite proxy 把 `/api` 转发到后端

如果前端接口不可用，首页和部分商品相关页面仍会显示本地假数据；这意味着“页面能打开”并不等于“后端链路正常”。

## 后续协作约定

后续新开上下文时，请默认记住以下事实：

- 这是“商城项目”，不是后台模板站，也不是只有视觉稿的静态网站
- 核心业务在 `h5-aura` + `admin-backend/src/modules/mall` + `admin-backend/src/modules/user`
- 前端 API 统一从 `h5-aura/src/lib/shop.js` 进入
- 支付和代付是现有正式业务路径的一部分
- `src/data/content.js` 是兜底假数据，不应和真实后端数据结构脱节

当发生以下变化时，必须同步更新本文件：

- 新增或删除子项目
- 前后端主技术栈变更
- 路由结构大改
- 核心实体或支付链路调整
- 认证方式调整
- 商品域从“美妆/香氛/饰品/包袋”扩展到新的主类目

## 重大结构调整记录

### 2026-03-29

- 确认仓库为双项目结构：`h5-aura` 前端商城 + `admin-backend` 后端服务
- 确认前台主题为轻奢审美 H5 商城，主营 Lip / Fragrance / Jewelry / Bags
- 确认后端主业务集中在 `mall` 与 `user` 模块
- 确认已具备注册登录、地址管理、购物车、收藏、下单、订单、评论、支付、代付完整链路
- 确认前端存在接口失败回退到本地假数据的设计
- 前台结算流程改为“先创建未支付订单，再到订单详情选择本人支付或代付”，`PLACE ORDER` 不再直接拉起支付
- 新增 H5 全局交互层：`GlobalConfirm`、`GlobalLoading`、`GlobalToast` 已挂载到 `h5-aura/src/App.vue`
- 危险操作和关键提交流程开始统一接入全局交互层，首批覆盖认证、账户、购物车、结算、订单、代付、评论页面
- PayPal 已从“模拟 approve 即成功”升级为真实 Orders API 对接，前端改为在订单详情页和代付页内渲染 PayPal Buttons
- 商城支付记录新增 `providerOrderId`，用于保存 PayPal order id 并支撑 capture / webhook 幂等
- PayPal 新增普通支付与代付两套 create/capture 接口；`epusdt` 旧的 `checkoutUrl` 跳转流保持不变

### 2026-04-01

- 商品模型做了精简，删除了商品 `subtitle` 和商品 `slug`，保留 `name + description` 作为前台展示与搜索主字段
- 影响目录：`admin-backend/src/modules/mall`、`h5-aura/src`、`web-admin/src/modules/mall/views`
- 后续协作结论：不要再把商品副标题或商品 SEO 标识当成现有字段使用；分类 `slug` 仍然保留并继续承担前台分类筛选与导航跳转

### 后续追加格式

请按下面格式继续维护：

- `YYYY-MM-DD`：做了什么结构调整
- 影响到哪些目录/模块/链路
- 对后续协作最重要的迁移结论是什么

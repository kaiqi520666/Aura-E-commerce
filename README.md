# Aesthetic-E-commerce

一个前后端分离的电商项目，主题是偏轻奢审美的 H5 商城，主营：

- Lip
- Fragrance
- Jewelry
- Bags

仓库当前包含 3 个主要子项目：

- `h5-aura`：前台 H5 商城，面向用户下单、支付、代付
- `admin-backend`：商城后端，基于 `cool-admin-midway`
- `web-admin`：后台管理前端，基于 `cool-admin-vue`

## 项目结构

### 1. `h5-aura`

技术栈：

- Vue 3
- Vite
- Pinia
- Vue Router
- Tailwind CSS 4

核心能力：

- 首页、分类、商品详情
- 登录注册、账户中心、地址管理
- 购物车、收藏、订单
- 普通支付、朋友代付
- PayPal Standard Checkout

### 2. `admin-backend`

技术栈：

- Node.js
- TypeScript
- Midway
- cool-admin-midway
- TypeORM
- MySQL

核心业务模块：

- `src/modules/mall`
- `src/modules/user`

当前已实现：

- 商品、分类、评论
- 购物车、收藏
- 下单、订单详情、订单列表
- PayPal 支付
- epusdt 支付
- 代付链接与代付支付

### 3. `web-admin`

后台管理前端，主要用于管理端能力，技术栈为：

- Vue 3
- TypeScript
- Vite
- Element Plus
- cool-admin-vue

## 本地开发

通常需要至少启动两个服务：

1. 后端 `admin-backend`
2. 前端 `h5-aura`

如果需要管理后台，再额外启动 `web-admin`

### 环境要求

- Node.js `>= 18`
- MySQL `>= 5.7`，建议 `8.x`

### 数据库

本地数据库配置在：

- [config.local.ts](E:/App/cursor/Aesthetic-E-commerce/admin-backend/src/config/config.local.ts)

当前默认数据库名是：

- `aura`

开发环境开启了：

- `synchronize: true`

这只适合本地开发，不适合生产环境。

## 启动方式

### 1. 启动后端

```powershell
cd E:\App\cursor\Aesthetic-E-commerce\admin-backend
npm install
npm run dev
```

默认端口：

- `8001`

### 2. 启动商城前端

```powershell
cd E:\App\cursor\Aesthetic-E-commerce\h5-aura
npm install
npm run dev
```

默认端口：

- `5173`

开发代理：

- 前端通过 `/api` 转发到 `http://localhost:8001`

### 3. 启动后台管理前端

```powershell
cd E:\App\cursor\Aesthetic-E-commerce\web-admin
npm install
npm run dev
```

具体端口以 `web-admin` 本地启动输出为准。

## 支付说明

当前商城包含两条支付链路：

- 普通支付
- 代付

支持的支付方式：

- PayPal
- epusdt

### PayPal

PayPal 已接入真实 Orders API，前端在以下页面内直接渲染 PayPal Buttons：

- 订单详情页
- 代付页

相关本地环境变量模板：

- [h5-aura/.env.local.example](E:/App/cursor/Aesthetic-E-commerce/h5-aura/.env.local.example)
- [admin-backend/.env.local.example](E:/App/cursor/Aesthetic-E-commerce/admin-backend/.env.local.example)

前端只需要：

- `VITE_PAYPAL_CLIENT_ID`
- `VITE_PAYPAL_CURRENCY`

后端需要：

- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_ENV`
- `PAYPAL_WEBHOOK_ID`
- `PAYPAL_CURRENCY`

注意：

- `PAYPAL_CLIENT_SECRET` 只能放后端
- 前端 `client id` 是公开配置，可以放在 `VITE_` 变量中

### 代付流程

当前项目支持“找朋友代付”：

1. 用户创建待支付订单
2. 在订单详情页生成代付链接
3. 朋友访问 `/proxy-payment/:token`
4. 朋友使用 PayPal 或 epusdt 支付
5. 原订单更新为已支付

## 重要说明

### 1. 这是一个真实商城项目，不是静态展示模板

仓库里已经包含完整业务链路，不要把它当成只有首页视觉稿的项目。

### 2. 前端有兜底假数据

`h5-aura` 在部分接口失败时会回退到本地内容数据，所以“页面能打开”不等于“后端链路正常”。

### 3. 根目录不是统一脚本仓库

当前根目录没有统一的 workspace 启动命令，子项目需要分别进入目录执行。

## 推荐阅读

- [AGENTS.md](E:/App/cursor/Aesthetic-E-commerce/AGENTS.md)：项目记忆、结构结论、重要链路记录
- [h5-aura/README.md](E:/App/cursor/Aesthetic-E-commerce/h5-aura/README.md)
- [admin-backend/README.md](E:/App/cursor/Aesthetic-E-commerce/admin-backend/README.md)
- [web-admin/README.md](E:/App/cursor/Aesthetic-E-commerce/web-admin/README.md)

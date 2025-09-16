# Cloudflare Pages 部署指南

## 方法一: 通过 Git 仓库部署 (推荐)

### 1. 准备 Git 仓库

```bash
# 初始化 Git 仓库
git init
git add .
git commit -m "Initial commit: Gold Price Converter"

# 推送到 GitHub 或 GitLab
git remote add origin https://github.com/yourusername/gold-price-converter.git
git push -u origin main
```

### 2. 在 Cloudflare Pages 中部署

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** 部分
3. 点击 **"Create a project"**
4. 选择 **"Connect to Git"**
5. 选择你的 Git 仓库
6. 配置构建设置:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (留空)
   - **Node.js version**: 18.x

### 3. 环境变量 (可选)

如果需要自定义配置，可以在 Cloudflare Pages 设置中添加环境变量。

## 方法二: 直接上传部署

### 1. 构建项目

```bash
npm run build
```

### 2. 上传到 Cloudflare Pages

1. 登录 Cloudflare Dashboard
2. 进入 **Pages** 部分
3. 点击 **"Create a project"**
4. 选择 **"Upload assets"**
5. 将 `dist` 文件夹中的所有文件拖拽到上传区域
6. 点击 **"Deploy site"**

## 方法三: 使用 Wrangler CLI

### 1. 安装 Wrangler

```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 部署

```bash
wrangler pages deploy dist --project-name gold-price-converter
```

## 自定义域名

1. 在 Cloudflare Pages 项目设置中
2. 进入 **Custom domains** 部分
3. 添加你的域名
4. 按照指示配置 DNS 记录

## 性能优化

项目已经配置了以下优化:

- ✅ 静态资源缓存 (1年)
- ✅ HTML 文件不缓存 (确保更新)
- ✅ Gzip 压缩
- ✅ 安全头设置
- ✅ 响应式设计

## 监控和维护

- 定期检查汇率 API 的可用性
- 监控页面加载性能
- 更新依赖包以获得安全补丁

## 故障排除

### 常见问题

1. **构建失败**: 检查 Node.js 版本是否为 18.x
2. **汇率获取失败**: 检查网络连接和 API 限制
3. **页面无法访问**: 检查自定义域名配置

### 调试步骤

1. 检查浏览器控制台错误
2. 验证 API 响应
3. 测试不同网络环境

## 更新部署

### Git 方式
```bash
git add .
git commit -m "Update: 描述更新内容"
git push origin main
```

### 直接上传方式
1. 重新运行 `npm run build`
2. 上传新的 `dist` 文件

---

**注意**: 确保在部署前测试所有功能正常工作。

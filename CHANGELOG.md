# 更新日志

## [1.1.2] - 2025-09-28

### 修改
- 更新Google Analytics配置
  - 将Google Analytics测量ID从占位符`GA_MEASUREMENT_ID`替换为实际ID`G-T3JJ1ZGS01`
  - 移除Google Analytics代码中的注释说明

## [11] - 2025-09-28

### 修改
- 更新域名配置
  - 将所有"your-domain.com"占位符替换为实际域名"https://gold.lg8.dpdns.org"
  - 更新Open Graph和Twitter Card标签中的图片URL
  - 更新结构化数据中的URL信息
  - 更新robots.txt和sitemap.xml中的域名信息
  - 更新文档中的域名引用

## [1.1.0] - 2025-09-28

### 新增
- SEO优化功能
  - 添加完整的meta标签（description, keywords, author, robots等）
  - 添加Open Graph标签以支持社交分享
  - 添加Twitter Card标签以支持Twitter分享
  - 添加结构化数据（JSON-LD）以提高搜索引擎理解
  - 添加canonical标签防止重复内容问题
  - 添加robots.txt文件指导搜索引擎爬虫
  - 添加sitemap.xml文件模板便于搜索引擎索引
  - 添加Google Analytics集成以跟踪用户行为
- PWA优化
  - 更新manifest.json文件，添加更多SEO友好的信息
  - 添加更多应用图标尺寸支持
- 性能优化
  - 更新Vite配置以优化构建输出
  - 添加HTTP安全头以提高网站安全性
  - 添加内容安全策略（CSP）以防止XSS攻击
  - 优化缓存策略以提高加载速度

### 修改
- 更新index.html文件中的SEO相关meta标签
- 更新README.md文件中的SEO相关信息
- 更新DEPLOYMENT.md文件中的SEO部署提示
- 更新_headers文件中的HTTP头部配置

## [1.0.0] - 2025-09-20

### 新增
- 初始版本发布
- 黄金价格换算器基本功能
- 支持美元/盎司、人民币/盎司、人民币/克、美元/克转换
- 实时金价获取（每1分钟自动更新）
- 汇率自动计算
- 响应式设计
- PWA支持（添加到主屏幕功能）
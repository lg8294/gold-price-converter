# 黄金价格换算器

一个现代化的黄金价格换算工具，可以将美元/盎司的黄金价格实时转换为人民币/克。

## 功能特点

- 🏆 **实时汇率**: 自动获取最新的美元兑人民币汇率
- 💰 **精确换算**: 基于标准盎司到克的转换比例 (1盎司 = 31.1035克)
- 🔄 **自动刷新**: 每5分钟自动更新汇率数据
- 📱 **响应式设计**: 完美适配桌面和移动设备
- ⚡ **快速加载**: 优化的性能和用户体验

## 技术栈

- **前端**: 原生 JavaScript (ES6+)
- **构建工具**: Vite
- **样式**: 纯 CSS3 (渐变、动画、响应式)
- **API**: ExchangeRate-API (免费汇率服务)
- **部署**: Cloudflare Pages

## 本地开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 部署到 Cloudflare Pages

### 方法一: 通过 Git 仓库

1. 将代码推送到 GitHub/GitLab 仓库
2. 在 Cloudflare Pages 中连接仓库
3. 设置构建配置:
   - **构建命令**: `npm run build`
   - **构建输出目录**: `dist`
   - **Node.js 版本**: 18.x

### 方法二: 直接上传

1. 运行 `npm run build` 构建项目
2. 将 `dist` 文件夹内容上传到 Cloudflare Pages
3. 配置自定义域名 (可选)

## 部署到 Cloudflare Workers

### 通过 Git 仓库

1. 将代码推送到 GitHub/GitLab 仓库
2. 在 Cloudflare Workers 中连接仓库
3. 设置构建配置:
   - **构建命令**: `npm run build`
   - **部署命令**: `npx wrangler deploy --assets=./dist`
   - **Node.js 版本**: 18.x
  
## 使用说明

1. 在输入框中输入黄金的美元价格 (每盎司)
2. 系统会自动获取当前汇率并计算
3. 查看换算结果，包括:
   - 人民币/克价格
   - 美元/盎司价格
   - 人民币/盎司价格

## 汇率数据

- 数据来源: ExchangeRate-API
- 更新频率: 每5分钟自动刷新
- 支持手动刷新

## 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

---

**注意**: 本工具仅供参考，实际交易请以官方价格为准。

# 网站状态监控

一个美观的网站状态监控面板，可部署到Netlify。

![预览图](https://via.placeholder.com/800x400?text=网站状态监控预览图)

## 功能

- 实时监控网站状态（在线/离线）
- 响应时间图表
- 历史状态时间线
- 搜索过滤功能
- 深色/浅色模式切换
- 多语言支持（英语/中文）
- 自动刷新数据

## 部署到Netlify

### 通过Netlify按钮一键部署

1. 点击下方按钮将项目部署到Netlify：

   [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yCENzh/status-monitor)

2. 等待部署完成（约1-2分钟）
3. 访问Netlify提供的域名查看监控面板

### 手动配置部署

如果您希望手动配置，请按照以下步骤：

1. 登录Netlify，选择"New site from git"
2. 选择您的Git提供商，然后选择这个仓库
3. 在构建设置中：
   - Build command: 留空 或填 `echo "No build needed"`
   - Publish directory: `public`
4. 点击"Deploy site"

项目部署后，每次将更改推送到仓库时，Netlify都会自动重新部署。

## 本地开发

1. 克隆仓库：
   ```bash
   git clone https://github.com/yourusername/status-monitor.git
   cd status-monitor
   ```

2. 启动本地服务器：
   ```bash
   npx serve public
   ```

3. 打开浏览器访问 http://localhost:3000

## 配置

1. 修改 `public/sites.json` 文件来添加/删除监控的网站
2. 修改 `public/locales` 目录下的语言文件来调整翻译内容
3. 支持的语言可以通过添加新的语言文件来扩展（如 `es.json` 等）

## 许可证

本项目采用 [MIT 许可证](LICENSE)

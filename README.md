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

1. 点击下方按钮将项目部署到Netlify：

   [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/status-monitor)

2. 等待部署完成（约1-2分钟）
3. 访问Netlify提供的域名查看监控面板

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

修改 `public/sites.json` 文件来添加/删除监控的网站。

## 许可证

本项目采用 [MIT 许可证](LICENSE)

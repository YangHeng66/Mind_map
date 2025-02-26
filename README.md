# DeepSeek思维导图生成器

基于DeepSeek大语言模型API构建的智能思维导图生成工具，帮助用户快速创建结构化的思维导图。

## 项目概述

DeepSeek思维导图生成器是一个基于Next.js和DeepSeek API开发的Web应用，能够根据用户输入的主题自动生成结构化的思维导图。该应用利用DeepSeek大语言模型的强大能力，将复杂主题拆解为层次分明的思维导图，帮助用户更好地组织和理解知识。

## 功能特点

- **智能生成**：基于DeepSeek大语言模型，根据主题自动生成结构化思维导图
- **深度控制**：支持调整思维导图的深度（1-5级），满足不同复杂度需求
- **交互式视图**：支持缩放、拖拽等操作，方便查看和调整思维导图
- **导出功能**：支持将思维导图导出为PNG图片或PDF文档
- **历史记录**：自动保存生成的思维导图历史，方便随时查看和重用
- **响应式设计**：适配不同设备屏幕，提供良好的移动端和桌面端体验

## 技术栈

- **前端框架**：Next.js 15.1.7 (React 19)
- **UI组件**：TailwindCSS
- **状态管理**：Zustand
- **思维导图渲染**：ReactFlow
- **导出功能**：html2canvas、jspdf
- **API通信**：Axios

## 安装步骤

1. 克隆项目仓库
```bash
git clone https://github.com/yourusername/deepseek-mindmap.git
cd deepseek-mindmap
```

2. 安装依赖
```bash
npm install
# 或
yarn install
# 或
pnpm install
```

3. 配置环境变量
创建`.env.local`文件，添加以下内容：
```
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_API_URL=https://api.deepseek.com/v1
```

4. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

5. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 使用指南

1. **生成思维导图**
   - 在主题输入框中输入您想要创建思维导图的主题
   - 使用深度滑块调整思维导图的复杂度（1-5级）
   - 点击"生成思维导图"按钮

2. **查看和操作思维导图**
   - 使用鼠标滚轮缩放思维导图
   - 拖动画布移动视图
   - 点击节点可以选中

3. **导出思维导图**
   - 点击"导出为PNG"按钮将思维导图保存为图片
   - 点击"导出为PDF"按钮将思维导图保存为PDF文档

4. **使用历史记录**
   - 在历史记录列表中查看之前生成的思维导图
   - 点击历史记录项可以重新加载对应的思维导图
   - 点击删除图标可以从历史记录中移除项目

## 部署

本项目可以部署到Vercel平台：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fdeepseek-mindmap)

部署时，请确保在Vercel项目设置中添加环境变量`DEEPSEEK_API_KEY`和`DEEPSEEK_API_URL`。

## 贡献指南

欢迎提交问题和贡献代码！请遵循以下步骤：

1. Fork本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开Pull Request

## 许可证

本项目采用MIT许可证 - 详情请参阅[LICENSE](LICENSE)文件。

## 联系方式

如有任何问题或建议，请通过以下方式联系我们：

- 项目仓库：[GitHub Issues](https://github.com/yourusername/deepseek-mindmap/issues)
- 电子邮件：your.email@example.com

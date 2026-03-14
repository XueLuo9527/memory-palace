# Memory Palace - AI 辅助开发提示词

## 项目上下文

**技术栈：**
- Next.js 15 (Pages Router)
- React 18
- Tailwind CSS
- three.js (3D 场景)
- localStorage (临时数据存储)

**设计风格：**
- 科技感深色主题
- iOS 风格毛玻璃效果
- 图书馆隐喻（书架、书籍）
- 3D 交互场景

## Cursor AI 提示词模板

### 1. 创建新组件

```
帮我创建一个 React 组件，实现 [功能描述]

要求：
- 使用 Next.js 15 Pages Router
- 函数式组件 + Hooks
- Tailwind CSS 样式（科技感 + iOS 风格）
- 支持移动端响应式
- 添加加载状态和错误处理
- 使用项目中已有的组件（Toast, ConfirmDialog 等）

参考文件：
- components/BookShelf.js
- components/Library3D.js
```

### 2. 修改现有组件

```
优化这个组件的 [性能/样式/功能]：

当前问题：
- [问题描述]

期望改进：
- [改进目标]

约束条件：
- 保持现有 API 不变
- 兼容移动端
- 保持科技感设计风格

参考文件：
- [相关文件路径]
```

### 3. 修复 Bug

```
修复这个 Bug：

现象：
- [错误现象]

复现步骤：
1. [步骤 1]
2. [步骤 2]

预期行为：
- [期望结果]

实际行为：
- [实际结果]

已尝试的解决方案：
- [尝试过的方法]

相关代码：
```javascript
// 粘贴相关代码
```
```

### 4. 性能优化

```
优化这个 three.js 场景的性能：

当前性能：
- FPS: [数值]
- 设备：[桌面/移动端]
- 书架数量：[数量]

目标：
- FPS ≥ 60（桌面）
- FPS ≥ 30（移动端）
- 内存占用 < 200MB

可接受方案：
- LOD（远距离简化）
- 实例化渲染
- 纹理压缩
- 移动端降级到 2D
```

### 5. 添加新功能

```
实现 [功能名称] 功能：

功能描述：
- [详细描述]

用户故事：
- 作为用户，我想要 [目标]，以便 [价值]

技术实现：
- 前端：[组件/页面]
- API: [路由]
- 数据：[存储方案]

验收标准：
- [ ] 标准 1
- [ ] 标准 2
- [ ] 标准 3

参考类似功能：
- [类似功能文件路径]
```

### 6. 代码解释

```
解释这段代码的工作原理：

```javascript
// 粘贴代码
```

请说明：
1. 每个函数的作用
2. 数据流向
3. 依赖关系
4. 可能的优化点
```

### 7. 测试用例

```
为这个组件编写测试用例：

组件：[组件路径]

测试场景：
- 正常流程
- 边界情况
- 错误处理
- 用户交互

使用框架：
- Jest
- React Testing Library
```

## 项目规范

### 代码风格

```javascript
// 组件命名
export default function ComponentName() {}

// Hooks 顺序
1. useState
2. useEffect
3. useContext
4. 自定义 hooks
5. 事件处理函数
6. 辅助函数

// 变量命名
const userName = '...'  // 驼峰式
const COMPONENT_NAME = '...'  // 常量大写

// 样式类名
className="ios-card animate-fade-in-up"  // 使用项目已有样式
```

### 提交信息

```bash
# 格式
<type>: <description>

# 类型
feat: 新功能
fix: 修复
docs: 文档
style: 样式
refactor: 重构
test: 测试
chore: 构建/工具

# 示例
feat: 添加图片压缩功能
fix: 修复登录跳转问题
docs: 更新开发日志
```

## 常用命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 生产启动
npm start

# Git
git add .
git commit -m "feat: ..."
git push

# 清理
rm -rf node_modules .next
npm install
```

## 文件修改检查清单

修改组件后检查：
- [ ] 移动端响应式
- [ ] 加载状态
- [ ] 错误处理
- [ ] 无障碍访问（aria 标签）
- [ ] 性能（避免不必要的渲染）
- [ ] 样式一致性

## 调试技巧

1. **React DevTools** - 检查组件状态
2. **浏览器控制台** - 查看错误日志
3. **Three.js Inspector** - 调试 3D 场景
4. **Tailwind DevTools** - 检查样式

---

*在 Cursor 中使用这些提示词，AI 会更好地理解项目上下文*

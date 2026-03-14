# Memory Palace - Cursor IDE 开发指南

**项目交接文档**  
**创建时间：** 2026-03-14  
**当前版本：** v0.9.1  
**下一版本：** v1.0.0（MVP）

---

## 🚀 快速开始

### 1. 克隆项目

```bash
# 克隆仓库
git clone https://github.com/XueLuo9527/memory-palace.git
cd memory-palace

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

---

## 📁 项目结构

```
memory-palace/
├── components/              # React 组件
│   ├── BookShelf.js        # 书架组件（核心）
│   ├── Library3D.js        # 3D 图书馆场景（three.js）
│   ├── Toast.js            # Toast 提示
│   ├── ConfirmDialog.js    # 确认对话框
│   ├── Skeleton.js         # 骨架屏
│   ├── LoadingSpinner.js   # 加载动画
│   └── ParticleBackground.js # 粒子背景
│
├── pages/                   # Next.js 页面路由
│   ├── api/                # API 路由
│   │   ├── auth/           # 认证 API
│   │   ├── palaces/        # 宫殿/书架/书籍 API
│   │   ├── upload.js       # 文件上传
│   │   ├── export.js       # 导出
│   │   └── import.js       # 导入
│   │
│   ├── palace/             # 宫殿相关页面
│   │   └── [id]/
│   │       ├── room/
│   │       │   └── [roomId].js   # 书架详情页
│   │       ├── view3d.js         # 3D 视图页
│   │       └── [id].js           # 宫殿详情页
│   │
│   ├── _app.js             # App 入口（UserContext）
│   ├── _document.js        # HTML 模板
│   ├── index.js            # 首页（Landing Page）
│   ├── palaces.js          # 图书馆列表
│   ├── login.js            # 登录页
│   └── settings.js         # 设置页
│
├── lib/                     # 工具库
│   ├── auth.js             # 认证模块（localStorage）
│   ├── db-local.js         # 本地数据库操作
│   ├── supabase.js         # Supabase 客户端
│   ├── api-handler.js      # API 处理器
│   └── validators.js       # 数据验证
│
├── styles/                  # 样式文件
│   ├── globals.css         # 全局样式（科技感 + iOS）
│   └── Home.module.css
│
├── data/                    # 本地数据（备用）
│   └── palaces.js
│
├── supabase/                # Supabase 配置
│   └── init.sql            # 数据库初始化脚本
│
├── public/                  # 静态资源
│
├── 开发日志.md               # 开发历史记录
├── ROADMAP.md              # 迭代计划
├── FEATURE_3D_LIBRARY.md   # 3D 功能文档
└── package.json
```

---

## 🔑 核心功能说明

### 1. 认证系统（localStorage 临时方案）

**文件：** `lib/auth.js`, `pages/_app.js`

```javascript
// 用户数据结构
user = {
  id: 'user-' + Date.now() + '-' + random,
  name: '用户名',
  createdAt: ISO8601
}

// 存储在 localStorage
localStorage.setItem('memory-palace-user', JSON.stringify(user))
```

**关键点：**
- `_app.js` 提供 `UserContext`（全局用户状态）
- 所有页面使用 `useContext(UserContext)` 获取用户
- 添加 `mounted` 状态避免 SSR 不匹配
- `authLoading` 期间不执行跳转

### 2. 3D 图书馆（three.js）

**文件：** `components/Library3D.js`, `pages/palace/[id]/view3d.js`

**功能：**
- 鼠标拖拽旋转视角
- 触摸滑动（移动端）
- 浮动书架和星空背景
- 随机展示记忆标题
- 3D/2D 切换按钮

**依赖：**
```json
{
  "three": "^0.174.0"
}
```

### 3. 图片上传

**文件：** `pages/api/upload.js`, `pages/palace/[id]/room/[roomId].js`

**限制：**
- 支持格式：JPG, PNG, GIF, WebP
- 最大大小：2MB
- 存储方式：Base64（localStorage）

### 4. 书架展示

**文件：** `components/BookShelf.js`

**特性：**
- 有图显封面，无图显书脊
- 6 种渐变配色循环
- 悬停显示详情
- 书架行分组（每行 8 本）

---

## 🎨 样式系统

### 科技感主题

```css
.tech-bg          /* 深色背景 + 网格 */
.ios-card         /* 毛玻璃卡片 */
.library-shelf    /* 书架容器 */
.book-spine       /* 书脊样式 */
.neon-glow        /* 霓虹发光 */
```

### 动画库

```css
.fade-in-up       /* 淡入上浮 */
.scale-in         /* 缩放进入 */
.book-place       /* 书本放入 */
.pulse-glow       /* 脉冲发光 */
.scan-line        /* 扫描线 */
.float-3d         /* 3D 悬浮 */
```

---

## 🔧 开发工具配置

### Cursor IDE 设置

1. **安装扩展：**
   - ESLint
   - Prettier
   - Tailwind CSS IntelliSense
   - three.js  snippets（可选）

2. **工作区设置：** `.cursor/settings.json`
   ```json
   {
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "editor.tabSize": 2,
     "files.autoSave": "afterDelay",
     "files.autoSaveDelay": 1000
   }
   ```

3. **推荐 Cursor AI 提示词：**
   ```
   - 使用 Next.js 15 + React 18
   - 样式使用 Tailwind CSS
   - 组件使用函数式 + Hooks
   - 3D 功能使用 three.js
   - 保持科技感 + iOS 风格
   ```

---

## 📋 当前待办事项（v1.0.0 冲刺）

### 🔴 高优先级

#### 1. 登录流程最终验证
```bash
# 测试步骤
1. 清除浏览器缓存（Ctrl+Shift+Delete）
2. 访问 http://localhost:3000
3. 输入名字 → 点击"开始使用"
4. 验证跳转到 /palaces
5. 点击图书馆 → 进入 3D 视图
6. 点击书架 → 进入房间详情
```

**预期结果：** 全程无错误跳转登录页

#### 2. 3D 性能优化
- [ ] 测试 10+ 书架时的 FPS
- [ ] 添加 LOD（远距离简化）
- [ ] 移动端自动降级到 2D

**修改文件：** `components/Library3D.js`

#### 3. 数据持久化迁移
- [ ] 配置 Supabase（`.env.local`）
- [ ] 迁移 localStorage → Supabase
- [ ] 测试多设备同步

**参考文件：** `supabase/init.sql`, `lib/supabase.js`

### 🟡 中优先级

#### 4. 图片上传优化
- [ ] 添加图片压缩（目标 < 500KB）
- [ ] 上传进度条
- [ ] 多图上传（最多 5 张）

**修改文件：** `pages/palace/[id]/room/[roomId].js`

#### 5. 新手引导
- [ ] 首次访问弹窗介绍
- [ ] 功能提示（3D 操作、上传等）
- [ ] 快捷键说明

**新增文件：** `components/Onboarding.js`

---

## 🐛 已知问题

### 问题 1：登录跳转（已修复，待验证）
**症状：** 输入名字后不跳转，或进入图书馆后跳回登录页  
**修复：** 
- `lib/auth.js` 添加浏览器环境检查
- 所有页面统一使用 `UserContext`
- 添加 `mounted` 状态

**验证方法：** 清除缓存后完整测试登录流程

### 问题 2：3D 场景性能
**症状：** 大量书架时 FPS 下降  
**临时方案：** 移动端自动切换到 2D 视图  
**待优化：** LOD、实例化渲染

### 问题 3：图片存储限制
**症状：** localStorage 有 5MB 限制，大图片会失败  
**解决方案：** 迁移到 Supabase Storage

---

## 🚀 部署流程

### Vercel 部署

1. **连接 GitHub 仓库**
   - 访问 https://vercel.com
   - Import Git Repository → 选择 `memory-palace`

2. **配置环境变量**
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_key
   ```

3. **自动部署**
   - Push 到 `master` 分支自动触发
   - 查看构建日志：Vercel Dashboard

### 本地构建测试

```bash
# 构建测试
npm run build

# 查看输出
# ✓ Compiled successfully
# ✓ Generating static pages (9/9)
# ✓ Finalized page sizes

# 启动生产服务器
npm start
```

---

## 📊 Git 工作流

### 分支策略

```bash
# 主分支
master          # 生产环境（随时可部署）

# 功能分支
feature/3d-library
feature/image-upload
feature/auth

# 修复分支
fix/login-redirect
fix/build-error
```

### 提交规范

```bash
# 新功能
feat: 3D 图书馆场景

# 修复
fix: 登录跳转问题

# 文档
docs: 更新开发日志

# 样式
style: 优化按钮动画

# 重构
refactor: 认证模块
```

---

## 🧪 测试清单

### 功能测试

- [ ] 登录流程（清除缓存 → 输入名字 → 跳转）
- [ ] 创建图书馆
- [ ] 创建书架
- [ ] 添加书籍（文本 + 图片）
- [ ] 编辑书籍
- [ ] 删除书籍
- [ ] 搜索书籍
- [ ] 标签筛选
- [ ] 3D 视图旋转
- [ ] 3D/2D 切换
- [ ] 导入导出

### 设备测试

- [ ] Chrome（桌面）
- [ ] Firefox（桌面）
- [ ] Safari（桌面）
- [ ] Chrome（Android）
- [ ] Safari（iOS）

### 性能测试

- [ ] 首屏加载 < 3 秒
- [ ] 3D 场景 FPS ≥ 30（桌面）
- [ ] 内存占用 < 200MB
- [ ] Lighthouse ≥ 90

---

## 📚 学习资源

### Next.js
- 官方文档：https://nextjs.org/docs
- 路由：https://nextjs.org/docs/pages

### three.js
- 官方文档：https://threejs.org/docs
- 示例：https://threejs.org/examples

### Tailwind CSS
- 官方文档：https://tailwindcss.com/docs
- 组件：https://tailwindui.com

### Supabase
- 官方文档：https://supabase.com/docs
- JS 客户端：https://supabase.com/docs/reference/javascript

---

## 💡 Cursor AI 使用技巧

### 1. 代码生成提示词

```
帮我创建一个 React 组件，实现...
- 使用 Next.js 15
- Tailwind CSS 样式
- 支持移动端响应式
- 添加加载状态
```

### 2. 代码解释

选中代码 → 右键 → "Explain Code"

### 3. Bug 修复

```
这个组件在移动端显示有问题，帮我修复：
- 问题描述：...
- 预期行为：...
- 实际行为：...
```

### 4. 性能优化

```
优化这个 three.js 场景的性能：
- 当前 FPS：...
- 目标 FPS：60
- 设备：移动端
```

---

## 🎯 下一步行动

### 今天（v1.0.0 冲刺 Day 1）

1. **环境搭建** (30 分钟)
   ```bash
   git clone ...
   npm install
   npm run dev
   ```

2. **登录流程测试** (30 分钟)
   - 清除缓存
   - 完整测试登录 → 3D 视图 → 房间

3. **3D 性能测试** (1 小时)
   - 创建 10+ 书架
   - 测试 FPS
   - 移动端降级

4. **开始数据迁移** (2 小时)
   - 配置 Supabase
   - 测试连接
   - 迁移用户数据

### 明天（v1.0.0 冲刺 Day 2）

- [ ] 完成数据迁移
- [ ] 图片压缩功能
- [ ] 新手引导
- [ ] 最终测试

---

## 📞 联系与支持

**项目仓库：** https://github.com/XueLuo9527/memory-palace  
**开发日志：** `开发日志.md`  
**迭代计划：** `ROADMAP.md`  
**功能文档：** `FEATURE_3D_LIBRARY.md`

---

*祝开发顺利！🚀*  
*最后更新：2026-03-14*

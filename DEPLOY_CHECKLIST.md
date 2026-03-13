# 🚀 Vercel 部署检查清单

## ✅ 部署前检查

### 1. 环境变量配置（必须！）🔴

在 Vercel 项目设置 → Environment Variables 中添加：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ 注意：**
- 变量名必须完全一致
- 需要添加 `NEXT_PUBLIC_` 前缀才能在客户端使用
- 添加后需要**重新部署**才能生效

**如何获取 Supabase 密钥：**
1. 登录 https://supabase.com
2. 进入你的项目
3. Settings → API
4. 复制 `Project URL` 和 `anon public` 密钥

---

### 2. 构建配置 ✅

**vercel.json** 已配置：
```json
{
  "framework": "nextjs",
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev"
}
```

**✅ 无需修改**

---

### 3. Node.js 版本 ✅

**package.json** 已配置：
```json
"engines": {
  "node": ">=18.0.0"
}
```

Vercel 会自动使用 Node.js 18+ 构建

---

### 4. 本地测试构建

在部署前，先在本地测试构建：

```bash
cd memory-palace
npm run build
```

如果本地构建失败，Vercel 也会失败。

**常见错误：**
- `ReferenceError: process is not defined` → 检查是否使用了 `process.env` 而不是 `process.env.NEXT_PUBLIC_*`
- `Module not found` → 检查依赖是否安装
- `Tailwind CSS not found` → 检查 `tailwind.config.js` 和 `postcss.config.js`

---

## 🔧 部署步骤

### 方法 1：GitHub 自动部署（推荐）

1. 将代码推送到 GitHub
2. 在 Vercel 导入 GitHub 仓库
3. 配置环境变量
4. 自动部署

### 方法 2：Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 生产环境部署
vercel --prod
```

---

## 🐛 常见问题

### 问题 1：页面空白/报错

**症状：** 部署后页面空白，控制台报错

**原因：** 环境变量未配置

**解决：**
1. Vercel 项目设置 → Environment Variables
2. 添加 Supabase 环境变量
3. Redeploy 重新部署

---

### 问题 2：样式丢失

**症状：** 页面没有样式，纯文本显示

**原因：** Tailwind CSS 配置问题

**解决：**
1. 检查 `tailwind.config.js` 的 `content` 路径
2. 检查 `postcss.config.js` 配置
3. 确保 `styles/globals.css` 包含 `@tailwind` 指令

---

### 问题 3：构建失败

**症状：** Vercel 构建日志显示错误

**解决：**
1. 查看 Vercel 部署日志
2. 本地运行 `npm run build` 复现错误
3. 根据错误信息修复

---

### 问题 4：API 路由 404

**症状：** API 请求返回 404

**原因：** API 文件路径错误

**解决：**
- 确保 API 文件在 `pages/api/` 目录下
- 检查文件命名（例如 `[id].js`）

---

## 📊 部署后验证

部署完成后，检查以下内容：

- [ ] 首页可以正常访问
- [ ] 样式正常显示（毛玻璃、渐变等）
- [ ] 登录功能正常
- [ ] 可以创建/查看宫殿
- [ ] 可以创建/查看房间
- [ ] 可以添加/查看记忆
- [ ] 搜索功能正常
- [ ] 标签筛选正常

---

## 🔗 相关链接

- Vercel 文档：https://vercel.com/docs
- Next.js 部署：https://nextjs.org/docs/deployment
- Supabase 文档：https://supabase.com/docs

---

**最后更新：** 2026-03-13 v0.9.0

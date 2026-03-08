# 📦 部署指南

## 方式一：Vercel 部署（推荐）

### 1. 连接 GitHub 仓库

1. 访问 https://vercel.com
2. 点击 **"New Project"**
3. 选择 **"Import Git Repository"**
4. 选择 `XueLuo9527/memory-palace` 仓库
5. 点击 **"Import"**

### 2. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

| 变量名 | 值 |
|--------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | 你的 Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 你的 Supabase anon/public key |

**获取 Supabase 配置：**
1. 访问 https://supabase.com
2. 创建新项目（或选择现有项目）
3. 进入 **Settings** → **API**
4. 复制 `Project URL` 和 `anon/public` key

### 3. 部署

1. 点击 **"Deploy"**
2. 等待构建完成（约 1-2 分钟）
3. 获得你的生产环境 URL（如 `https://memory-palace-ten.vercel.app`）

### 4. 自动部署

之后每次 push 到 `master` 分支，Vercel 会自动重新部署！

---

## 方式二：本地部署测试

```bash
# 1. 安装依赖
npm install

# 2. 创建环境变量文件
cp .env.local.example .env.local

# 3. 编辑 .env.local，填入 Supabase 配置

# 4. 开发模式
npm run dev

# 5. 生产构建
npm run build
npm start
```

---

## 📁 项目文件说明

| 文件 | 说明 |
|------|------|
| `vercel.json` | Vercel 部署配置 |
| `.env.local.example` | 环境变量示例 |
| `supabase/init.sql` | 数据库初始化脚本 |

---

## ✅ 部署检查清单

- [ ] 在 Supabase 创建项目
- [ ] 运行 `supabase/init.sql` 初始化数据库
- [ ] 在 Vercel 连接 GitHub 仓库
- [ ] 配置 Vercel 环境变量
- [ ] 完成首次部署
- [ ] 测试创建宫殿、房间、记忆功能

---

*最后更新：2026-03-08*

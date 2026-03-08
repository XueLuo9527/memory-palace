# 🗄️ Supabase 配置指南

## 步骤 1：创建 Supabase 项目

1. 访问 https://supabase.com
2. 点击 **"Start your project"** 或 **"New Project"**
3. 填写项目信息：
   - **Name:** memory-palace
   - **Database Password:** 设置一个强密码（保存好！）
   - **Region:** 选择离你最近的区域（如 Asia East (Tokyo)）
4. 点击 **"Create new project"**
5. 等待 2-3 分钟项目初始化完成

---

## 步骤 2：获取 API 密钥

1. 进入项目后，点击左侧 **Settings**（齿轮图标）
2. 选择 **API**
3. 复制以下两个值：
   - **Project URL** → 用于 `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public** key → 用于 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

示例：
```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 步骤 3：初始化数据库

### 3.1 打开 SQL Editor

1. 在 Supabase 项目页面，点击左侧 **SQL Editor**
2. 点击 **"New query"**

### 3.2 运行初始化脚本

1. 打开项目中的 `supabase/init.sql` 文件
2. 复制全部内容
3. 粘贴到 Supabase SQL Editor
4. 点击 **"Run"** 或按 `Ctrl+Enter`

### 3.3 验证

运行成功后，你应该看到：
- ✅ 3 个表：`palaces`, `rooms`, `memories`
- ✅ 9 个索引
- ✅ 12 个 RLS 策略
- ✅ 3 个触发器
- ✅ 1 个函数

可以在 **Table Editor** 中查看表结构。

---

## 步骤 4：配置环境变量

### 4.1 本地开发

在项目根目录创建 `.env.local` 文件：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4.2 Vercel 部署

1. 访问 https://vercel.com/dashboard
2. 选择你的 `memory-palace` 项目
3. 点击 **Settings** → **Environment Variables**
4. 添加两个变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. 点击 **"Save"**
6. 重新部署项目（**Deployments** → 选择最新部署 → **"Redeploy"**）

---

## 步骤 5：测试连接

### 5.1 本地测试

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### 5.2 测试功能

1. 创建一个新宫殿
2. 在宫殿中创建一个房间
3. 在房间中添加一条记忆
4. 检查 Supabase Table Editor 中是否有数据

---

## 🔧 常见问题

### Q: 创建数据失败，报错 "permission denied"

**A:** 检查 RLS 策略是否正确启用：

```sql
-- 检查 RLS 是否启用
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- 应该显示 palaces, rooms, memories 都为 true
```

### Q: 删除宫殿后，房间和记忆没有被删除

**A:** 检查外键的级联删除是否正确设置：

```sql
-- 检查外键约束
SELECT 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE constraint_type = 'FOREIGN KEY';
```

应该看到 `delete_rule` 为 `CASCADE`。

### Q: 搜索功能不工作

**A:** 检查全文搜索索引：

```sql
-- 检查索引
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'memories';
```

---

## 📊 数据库监控

### 查看数据量

```sql
-- 统计各表数据量
SELECT 
    'palaces' as table_name, count(*) as row_count FROM palaces
UNION ALL
SELECT 'rooms', count(*) FROM rooms
UNION ALL
SELECT 'memories', count(*) FROM memories;
```

### 查看用户数据

```sql
-- 查看某个用户的所有数据
SELECT 
    p.name as palace_name,
    r.name as room_name,
    m.title as memory_title,
    m.content as memory_content
FROM palaces p
LEFT JOIN rooms r ON r.palace_id = p.id
LEFT JOIN memories m ON m.room_id = r.id
WHERE p.user_id = '你的用户 ID';
```

---

## 🔒 安全建议

1. **不要泄露 service role key** - 只在服务端使用
2. **定期备份数据库** - Supabase 自动备份，但建议导出重要数据
3. **监控 API 使用量** - 免费额度：500MB 数据库，50GB 带宽/月
4. **启用双因素认证** - 保护 Supabase 账号安全

---

## 📚 相关资源

- Supabase 文档：https://supabase.com/docs
- Next.js + Supabase 教程：https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- RLS 最佳实践：https://supabase.com/docs/guides/auth/row-level-security

---

*最后更新：2026-03-08*

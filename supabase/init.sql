-- 记忆宫殿数据库初始化脚本
-- 在 Supabase SQL Editor 中运行此脚本

-- 启用 UUID 扩展
create extension if not exists "uuid-ossp";

-- 宫殿表
create table if not exists palaces (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name varchar(255) not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 房间表
create table if not exists rooms (
  id uuid default uuid_generate_v4() primary key,
  palace_id uuid references palaces(id) on delete cascade not null,
  name varchar(255) not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 记忆表
create table if not exists memories (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references rooms(id) on delete cascade not null,
  title varchar(255) not null,
  content text,
  tags text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 创建索引以提升查询性能
create index if not exists idx_palaces_user_id on palaces(user_id);
create index if not exists idx_rooms_palace_id on rooms(palace_id);
create index if not exists idx_memories_room_id on memories(room_id);
create index if not exists idx_memories_title on memories(title);
create index if not exists idx_memories_content on memories using gin(to_tsvector('simple', content));

-- 启用行级安全（RLS）
alter table palaces enable row level security;
alter table rooms enable row level security;
alter table memories enable row level security;

-- 宫殿策略：用户只能访问自己的宫殿
create policy "用户只能查看自己的宫殿" on palaces
  for select using (auth.uid() = user_id);

create policy "用户只能创建自己的宫殿" on palaces
  for insert with check (auth.uid() = user_id);

create policy "用户只能更新自己的宫殿" on palaces
  for update using (auth.uid() = user_id);

create policy "用户只能删除自己的宫殿" on palaces
  for delete using (auth.uid() = user_id);

-- 房间策略：通过宫殿关联控制访问
create policy "用户可以查看有权限宫殿的房间" on rooms
  for select using (
    exists (
      select 1 from palaces
      where palaces.id = rooms.palace_id
      and palaces.user_id = auth.uid()
    )
  );

create policy "用户可以创建有权限宫殿的房间" on rooms
  for insert with check (
    exists (
      select 1 from palaces
      where palaces.id = rooms.palace_id
      and palaces.user_id = auth.uid()
    )
  );

create policy "用户可以更新有权限宫殿的房间" on rooms
  for update using (
    exists (
      select 1 from palaces
      where palaces.id = rooms.palace_id
      and palaces.user_id = auth.uid()
    )
  );

create policy "用户可以删除有权限宫殿的房间" on rooms
  for delete using (
    exists (
      select 1 from palaces
      where palaces.id = rooms.palace_id
      and palaces.user_id = auth.uid()
    )
  );

-- 记忆策略：通过房间关联控制访问
create policy "用户可以查看有权限房间的记忆" on memories
  for select using (
    exists (
      select 1 from rooms
      join palaces on palaces.id = rooms.palace_id
      where rooms.id = memories.room_id
      and palaces.user_id = auth.uid()
    )
  );

create policy "用户可以创建有权限房间的记忆" on memories
  for insert with check (
    exists (
      select 1 from rooms
      join palaces on palaces.id = rooms.palace_id
      where rooms.id = memories.room_id
      and palaces.user_id = auth.uid()
    )
  );

create policy "用户可以更新有权限房间的记忆" on memories
  for update using (
    exists (
      select 1 from rooms
      join palaces on palaces.id = rooms.palace_id
      where rooms.id = memories.room_id
      and palaces.user_id = auth.uid()
    )
  );

create policy "用户可以删除有权限房间的记忆" on memories
  for delete using (
    exists (
      select 1 from rooms
      join palaces on palaces.id = rooms.palace_id
      where rooms.id = memories.room_id
      and palaces.user_id = auth.uid()
    )
  );

-- 自动更新 updated_at 的函数
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- 为所有表添加触发器
create trigger update_palaces_updated_at before update on palaces
  for each row execute function update_updated_at_column();

create trigger update_rooms_updated_at before update on rooms
  for each row execute function update_updated_at_column();

create trigger update_memories_updated_at before update on memories
  for each row execute function update_updated_at_column();

-- 插入测试数据（可选）
-- insert into palaces (user_id, name, description) values 
--   ('your-user-id', '我的第一座宫殿', '开始你的记忆之旅');

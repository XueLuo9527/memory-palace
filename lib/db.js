import { supabase, TABLES } from '../lib/supabase'

/**
 * 宫殿操作
 */

// 获取所有宫殿
export async function getPalaces(userId) {
  const { data, error } = await supabase
    .from(TABLES.PALACES)
    .select('*, rooms(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('获取宫殿失败:', error)
    return []
  }
  
  return data || []
}

// 获取单个宫殿
export async function getPalaceById(id, userId) {
  const { data, error } = await supabase
    .from(TABLES.PALACES)
    .select('*, rooms(*)')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  
  if (error) {
    console.error('获取宫殿详情失败:', error)
    return null
  }
  
  return data
}

// 创建宫殿
export async function createPalace(userId, name, description = '') {
  const { data, error } = await supabase
    .from(TABLES.PALACES)
    .insert({
      user_id: userId,
      name,
      description,
    })
    .select()
    .single()
  
  if (error) {
    console.error('创建宫殿失败:', error)
    return null
  }
  
  return data
}

// 更新宫殿
export async function updatePalace(id, userId, updates) {
  const { data, error } = await supabase
    .from(TABLES.PALACES)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) {
    console.error('更新宫殿失败:', error)
    return null
  }
  
  return data
}

// 删除宫殿
export async function deletePalace(id, userId) {
  const { error } = await supabase
    .from(TABLES.PALACES)
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  
  if (error) {
    console.error('删除宫殿失败:', error)
    return false
  }
  
  return true
}

/**
 * 房间操作
 */

// 创建房间
export async function createRoom(palaceId, name, description = '') {
  const { data, error } = await supabase
    .from(TABLES.ROOMS)
    .insert({
      palace_id: palaceId,
      name,
      description,
    })
    .select()
    .single()
  
  if (error) {
    console.error('创建房间失败:', error)
    return null
  }
  
  return data
}

// 获取房间
export async function getRoomById(roomId, userId) {
  const { data, error } = await supabase
    .from(TABLES.ROOMS)
    .select(`
      *,
      memories:memories(*)
    `)
    .eq('id', roomId)
    .eq('palaces.user_id', userId)
    .single()
  
  if (error) {
    console.error('获取房间失败:', error)
    return null
  }
  
  return data
}

// 更新房间
export async function updateRoom(roomId, updates) {
  const { data, error } = await supabase
    .from(TABLES.ROOMS)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', roomId)
    .select()
    .single()
  
  if (error) {
    console.error('更新房间失败:', error)
    return null
  }
  
  return data
}

// 删除房间
export async function deleteRoom(roomId) {
  const { error } = await supabase
    .from(TABLES.ROOMS)
    .delete()
    .eq('id', roomId)
  
  if (error) {
    console.error('删除房间失败:', error)
    return false
  }
  
  return true
}

/**
 * 记忆操作
 */

// 创建记忆
export async function createMemory(roomId, title, content = '', tags = []) {
  const { data, error } = await supabase
    .from(TABLES.MEMORIES)
    .insert({
      room_id: roomId,
      title,
      content,
      tags,
    })
    .select()
    .single()
  
  if (error) {
    console.error('创建记忆失败:', error)
    return null
  }
  
  return data
}

// 更新记忆
export async function updateMemory(memoryId, updates) {
  const { data, error } = await supabase
    .from(TABLES.MEMORIES)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', memoryId)
    .select()
    .single()
  
  if (error) {
    console.error('更新记忆失败:', error)
    return null
  }
  
  return data
}

// 删除记忆
export async function deleteMemory(memoryId) {
  const { error } = await supabase
    .from(TABLES.MEMORIES)
    .delete()
    .eq('id', memoryId)
  
  if (error) {
    console.error('删除记忆失败:', error)
    return false
  }
  
  return true
}

// 搜索记忆
export async function searchMemories(palaceId, query) {
  const { data, error } = await supabase
    .from(TABLES.MEMORIES)
    .select(`
      *,
      room:rooms(name, id)
    `)
    .eq('rooms.palace_id', palaceId)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
  
  if (error) {
    console.error('搜索记忆失败:', error)
    return []
  }
  
  return data || []
}

/**
 * 标签操作
 */

// 按标签筛选记忆
export async function getMemoriesByTag(palaceId, tag) {
  const { data, error } = await supabase
    .from(TABLES.MEMORIES)
    .select(`
      *,
      room:rooms(name, id)
    `)
    .eq('rooms.palace_id', palaceId)
    .contains('tags', [tag])
  
  if (error) {
    console.error('按标签筛选失败:', error)
    return []
  }
  
  return data || []
}

// 获取宫殿下所有标签
export async function getAllTags(palaceId) {
  const { data, error } = await supabase
    .from(TABLES.MEMORIES)
    .select('tags')
    .eq('room_id', palaceId)
  
  if (error) {
    console.error('获取标签失败:', error)
    return []
  }
  
  // 去重并扁平化标签数组
  const tagSet = new Set()
  data?.forEach(item => {
    item.tags?.forEach(tag => tagSet.add(tag))
  })
  
  return Array.from(tagSet)
}

// 为记忆添加标签
export async function addTagsToMemory(memoryId, tags) {
  const { data, error } = await supabase
    .from(TABLES.MEMORIES)
    .update({
      tags: [...new Set(tags)], // 去重
      updated_at: new Date().toISOString(),
    })
    .eq('id', memoryId)
    .select()
    .single()
  
  if (error) {
    console.error('添加标签失败:', error)
    return null
  }
  
  return data
}

// 从记忆移除标签
export async function removeTagFromMemory(memoryId, tag) {
  // 先获取当前标签
  const { data: current } = await supabase
    .from(TABLES.MEMORIES)
    .select('tags')
    .eq('id', memoryId)
    .single()
  
  if (!current) return null
  
  const newTags = current.tags?.filter(t => t !== tag) || []
  
  const { data, error } = await supabase
    .from(TABLES.MEMORIES)
    .update({
      tags: newTags,
      updated_at: new Date().toISOString(),
    })
    .eq('id', memoryId)
    .select()
    .single()
  
  if (error) {
    console.error('移除标签失败:', error)
    return null
  }
  
  return data
}

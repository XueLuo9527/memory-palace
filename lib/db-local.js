/**
 * 本地存储数据库（localStorage 模式）
 * 无需 Supabase，数据存储在浏览器
 */

const STORAGE_KEY = 'memory-palace-data'

// 初始化数据结构
function getStorage() {
  if (typeof window === 'undefined') {
    return { palaces: [], nextId: 1, nextRoomId: 1, nextMemoryId: 1 }
  }
  
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  return { palaces: [], nextId: 1, nextRoomId: 1, nextMemoryId: 1 }
}

// 保存数据
function saveStorage(data) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }
}

/**
 * 宫殿操作
 */

export async function getPalaces(userId) {
  const storage = getStorage()
  return storage.palaces.filter(p => p.userId === userId)
}

export async function getPalaceById(id, userId) {
  const storage = getStorage()
  return storage.palaces.find(p => p.id === id && p.userId === userId)
}

export async function createPalace(userId, name, description = '') {
  const storage = getStorage()
  const palace = {
    id: storage.nextId++,
    userId,
    name,
    description,
    created_at: new Date().toISOString(),
    rooms: []
  }
  storage.palaces.push(palace)
  saveStorage(storage)
  return palace
}

export async function deletePalace(id, userId) {
  const storage = getStorage()
  const initialLength = storage.palaces.length
  storage.palaces = storage.palaces.filter(p => !(p.id === id && p.userId === userId))
  const deleted = storage.palaces.length < initialLength
  if (deleted) saveStorage(storage)
  return deleted
}

export async function updatePalace(id, updates) {
  const storage = getStorage()
  const palace = storage.palaces.find(p => p.id === id)
  if (!palace) return null
  
  Object.assign(palace, updates)
  palace.updated_at = new Date().toISOString()
  saveStorage(storage)
  return palace
}

/**
 * 房间操作
 */

export async function createRoom(palaceId, name, description = '') {
  const storage = getStorage()
  const palace = storage.palaces.find(p => p.id === palaceId)
  if (!palace) return null
  
  const room = {
    id: storage.nextRoomId++,
    name,
    description,
    created_at: new Date().toISOString(),
    memories: []
  }
  palace.rooms.push(room)
  saveStorage(storage)
  return room
}

export async function getRoomById(roomId, userId) {
  const storage = getStorage()
  for (const palace of storage.palaces) {
    if (palace.userId === userId) {
      const room = palace.rooms.find(r => r.id === roomId)
      if (room) return room
    }
  }
  return null
}

export async function updateRoom(roomId, updates) {
  const storage = getStorage()
  for (const palace of storage.palaces) {
    const room = palace.rooms.find(r => r.id === roomId)
    if (room) {
      Object.assign(room, updates)
      room.updated_at = new Date().toISOString()
      saveStorage(storage)
      return room
    }
  }
  return null
}

export async function deleteRoom(roomId) {
  const storage = getStorage()
  for (const palace of storage.palaces) {
    const initialLength = palace.rooms.length
    palace.rooms = palace.rooms.filter(r => r.id !== roomId)
    if (palace.rooms.length < initialLength) {
      saveStorage(storage)
      return true
    }
  }
  return false
}

/**
 * 记忆操作
 */

export async function createMemory(roomId, title, content = '', tags = [], image = null) {
  const storage = getStorage()
  for (const palace of storage.palaces) {
    const room = palace.rooms.find(r => r.id === roomId)
    if (room) {
      const memory = {
        id: storage.nextMemoryId++,
        title,
        content,
        tags,
        image, // 添加图片字段
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      room.memories.push(memory)
      saveStorage(storage)
      return memory
    }
  }
  return null
}

export async function updateMemory(memoryId, updates) {
  const storage = getStorage()
  for (const palace of storage.palaces) {
    for (const room of palace.rooms) {
      const memory = room.memories.find(m => m.id === memoryId)
      if (memory) {
        Object.assign(memory, updates)
        memory.updated_at = new Date().toISOString()
        saveStorage(storage)
        return memory
      }
    }
  }
  return null
}

export async function deleteMemory(memoryId) {
  const storage = getStorage()
  for (const palace of storage.palaces) {
    for (const room of palace.rooms) {
      const initialLength = room.memories.length
      room.memories = room.memories.filter(m => m.id !== memoryId)
      if (room.memories.length < initialLength) {
        saveStorage(storage)
        return true
      }
    }
  }
  return false
}

/**
 * 搜索和标签
 */

export async function searchMemories(palaceId, query) {
  const storage = getStorage()
  const palace = storage.palaces.find(p => p.id === palaceId)
  if (!palace) return []
  
  const results = []
  const lowerQuery = query.toLowerCase()
  
  palace.rooms.forEach(room => {
    room.memories.forEach(memory => {
      if (
        memory.title.toLowerCase().includes(lowerQuery) ||
        memory.content.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          ...memory,
          roomName: room.name,
          roomId: room.id
        })
      }
    })
  })
  
  return results
}

export async function getMemoriesByTag(palaceId, tag) {
  const storage = getStorage()
  const palace = storage.palaces.find(p => p.id === palaceId)
  if (!palace) return []
  
  const results = []
  palace.rooms.forEach(room => {
    room.memories.forEach(memory => {
      if (memory.tags && memory.tags.includes(tag)) {
        results.push({
          ...memory,
          roomName: room.name,
          roomId: room.id
        })
      }
    })
  })
  
  return results
}

export async function getAllTags(palaceId) {
  const storage = getStorage()
  const palace = storage.palaces.find(p => p.id === palaceId)
  if (!palace) return []
  
  const tagSet = new Set()
  palace.rooms.forEach(room => {
    room.memories.forEach(memory => {
      if (memory.tags) {
        memory.tags.forEach(tag => tagSet.add(tag))
      }
    })
  })
  
  return Array.from(tagSet)
}

export async function addTagsToMemory(memoryId, tags) {
  const storage = getStorage()
  for (const palace of storage.palaces) {
    for (const room of palace.rooms) {
      const memory = room.memories.find(m => m.id === memoryId)
      if (memory) {
        if (!memory.tags) memory.tags = []
        tags.forEach(tag => {
          if (!memory.tags.includes(tag)) memory.tags.push(tag)
        })
        memory.updated_at = new Date().toISOString()
        saveStorage(storage)
        return memory
      }
    }
  }
  return null
}

export async function removeTagFromMemory(memoryId, tag) {
  const storage = getStorage()
  for (const palace of storage.palaces) {
    for (const room of palace.rooms) {
      const memory = room.memories.find(m => m.id === memoryId)
      if (memory && memory.tags) {
        memory.tags = memory.tags.filter(t => t !== tag)
        memory.updated_at = new Date().toISOString()
        saveStorage(storage)
        return memory
      }
    }
  }
  return null
}

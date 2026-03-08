// 临时数据存储（后续会替换为 Supabase）
let palaces = [
  {
    id: 1,
    name: '我的第一座宫殿',
    description: '开始你的记忆之旅',
    createdAt: new Date().toISOString(),
    rooms: []
  }
]

let nextId = 2

export function getPalaces() {
  return palaces
}

export function getPalaceById(id) {
  return palaces.find(p => p.id === id)
}

export function createPalace(name, description) {
  const palace = {
    id: nextId++,
    name,
    description,
    createdAt: new Date().toISOString(),
    rooms: []
  }
  palaces.push(palace)
  return palace
}

export function deletePalace(id) {
  palaces = palaces.filter(p => p.id !== id)
  return true
}

// 房间操作
export function createRoom(palaceId, name, description) {
  const palace = getPalaceById(palaceId)
  if (!palace) return null
  
  const room = {
    id: Date.now(),
    name,
    description,
    createdAt: new Date().toISOString(),
    memories: []
  }
  palace.rooms.push(room)
  return room
}

export function getRoomById(palaceId, roomId) {
  const palace = getPalaceById(palaceId)
  if (!palace) return null
  return palace.rooms.find(r => r.id === roomId)
}

export function deleteRoom(palaceId, roomId) {
  const palace = getPalaceById(palaceId)
  if (!palace) return false
  palace.rooms = palace.rooms.filter(r => r.id !== roomId)
  return true
}

// 记忆操作
export function createMemory(palaceId, roomId, title, content) {
  const palace = getPalaceById(palaceId)
  if (!palace) return null
  
  const room = palace.rooms.find(r => r.id === roomId)
  if (!room) return null
  
  const memory = {
    id: Date.now(),
    title,
    content: content || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: []
  }
  room.memories.push(memory)
  return memory
}

export function updateMemory(palaceId, roomId, memoryId, title, content) {
  const palace = getPalaceById(palaceId)
  if (!palace) return null
  
  const room = palace.rooms.find(r => r.id === roomId)
  if (!room) return null
  
  const memory = room.memories.find(m => m.id === memoryId)
  if (!memory) return null
  
  if (title) memory.title = title
  if (content !== undefined) memory.content = content
  memory.updatedAt = new Date().toISOString()
  
  return memory
}

export function deleteMemory(palaceId, roomId, memoryId) {
  const palace = getPalaceById(palaceId)
  if (!palace) return false
  
  const room = palace.rooms.find(r => r.id === roomId)
  if (!room) return false
  
  const initialLength = room.memories.length
  room.memories = room.memories.filter(m => m.id !== memoryId)
  
  return room.memories.length < initialLength
}

export function searchMemories(palaceId, query) {
  const palace = getPalaceById(palaceId)
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

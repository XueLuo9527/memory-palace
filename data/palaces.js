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

/**
 * 3D 图书馆场景组件
 * 使用 three.js 渲染可交互的 3D 图书馆空间
 */

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export default function Library3D({ palace, onRoomClick }) {
  const containerRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const roomsRef = useRef([])
  const isDragging = useRef(false)
  const previousMousePosition = useRef({ x: 0, y: 0 })
  const rotationRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!containerRef.current || !palace) return

    initScene()
    createLibrary()
    animate()

    // 事件监听
    const container = containerRef.current
    container.addEventListener('mousedown', handleMouseDown)
    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseup', handleMouseUp)
    container.addEventListener('mouseleave', handleMouseUp)
    container.addEventListener('wheel', handleWheel)
    
    // 触摸事件
    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)

    // 窗口大小变化
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      cameraRef.current.aspect = width / height
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      container.removeEventListener('mousedown', handleMouseDown)
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseup', handleMouseUp)
      container.removeEventListener('mouseleave', handleMouseUp)
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('resize', handleResize)
      
      // 清理场景
      if (rendererRef.current) {
        rendererRef.current.dispose()
        rendererRef.current.forceContextLoss()
      }
      if (sceneRef.current) {
        sceneRef.current.clear()
      }
    }
  }, [palace])

  const initScene = () => {
    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // 场景
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a1a)
    scene.fog = new THREE.Fog(0x0a0a1a, 10, 50)
    sceneRef.current = scene

    // 相机
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.set(0, 3, 8)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // 渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // 灯光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0x00ffff, 1, 50)
    pointLight.position.set(5, 5, 5)
    pointLight.castShadow = true
    scene.add(pointLight)

    const pointLight2 = new THREE.PointLight(0xff00ff, 0.5, 50)
    pointLight2.position.set(-5, 3, -5)
    scene.add(pointLight2)

    // 地板
    const floorGeometry = new THREE.PlaneGeometry(20, 20)
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a2e,
      roughness: 0.8,
      metalness: 0.2
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -2
    floor.receiveShadow = true
    scene.add(floor)

    // 星空背景粒子
    const starsGeometry = new THREE.BufferGeometry()
    const starCount = 1000
    const positions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100
      positions[i + 1] = (Math.random() - 0.5) * 100 + 20
      positions[i + 2] = (Math.random() - 0.5) * 100
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 })
    const stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)

    setLoading(false)
  }

  const createLibrary = () => {
    const scene = sceneRef.current
    if (!scene || !palace?.rooms) return

    // 清理旧房间
    roomsRef.current.forEach(room => scene.remove(room))
    roomsRef.current = []

    const roomCount = palace.rooms.length
    const radius = 6
    
    palace.rooms.forEach((room, index) => {
      const angle = (index / roomCount) * Math.PI * 2
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius

      // 创建书架组
      const roomGroup = new THREE.Group()
      roomGroup.position.set(x, 0, z)
      roomGroup.lookAt(0, 0, 0)

      // 书架主体
      const shelfGeometry = new THREE.BoxGeometry(2, 3, 0.5)
      const shelfMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2d2d44,
        roughness: 0.6,
        metalness: 0.3,
        emissive: 0x1a1a2e,
        emissiveIntensity: 0.2
      })
      const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial)
      shelf.castShadow = true
      shelf.receiveShadow = true
      roomGroup.add(shelf)

      // 书架上的书（简化表示）
      const bookCount = Math.min(room.memories?.length || 0, 5)
      for (let i = 0; i < bookCount; i++) {
        const bookGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.05)
        const bookMaterial = new THREE.MeshStandardMaterial({ 
          color: new THREE.Color().setHSL(i / bookCount, 0.7, 0.5),
          emissive: new THREE.Color().setHSL(i / bookCount, 0.7, 0.3),
          emissiveIntensity: 0.3
        })
        const book = new THREE.Mesh(bookGeometry, bookMaterial)
        book.position.set(-0.3 + i * 0.15, -0.5, 0.26)
        book.castShadow = true
        roomGroup.add(book)
      }

      // 发光底座
      const baseGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.1, 32)
      const baseMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.3
      })
      const base = new THREE.Mesh(baseGeometry, baseMaterial)
      base.position.y = -2
      roomGroup.add(base)

      // 浮动标签（显示房间名和部分记忆标题）
      const labelGroup = createFloatingLabel(room, room.memories)
      labelGroup.position.y = 2.5
      roomGroup.add(labelGroup)

      // 存储房间数据用于点击检测
      roomGroup.userData = { roomId: room.id, roomName: room.name }

      scene.add(roomGroup)
      roomsRef.current.push(roomGroup)

      // 添加动画
      roomGroup.userData.floatOffset = Math.random() * Math.PI * 2
    })

    // 添加中心标题
    createCenterTitle(palace.name)
  }

  const createFloatingLabel = (room, memories) => {
    const group = new THREE.Group()

    // 房间名标签
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = 512
    canvas.height = 128

    // 背景
    context.fillStyle = 'rgba(0, 0, 0, 0.7)'
    context.fillRect(0, 0, 512, 128)
    
    // 边框
    context.strokeStyle = '#00ffff'
    context.lineWidth = 3
    context.strokeRect(5, 5, 502, 118)

    // 房间名
    context.fillStyle = '#ffffff'
    context.font = 'bold 36px Arial'
    context.textAlign = 'center'
    context.fillText(room.name, 256, 50)

    // 记忆标题（随机展示 1-3 个）
    if (memories && memories.length > 0) {
      const displayCount = Math.min(3, memories.length)
      const shuffled = [...memories].sort(() => Math.random() - 0.5)
      
      context.font = '24px Arial'
      context.fillStyle = '#00ffff'
      
      for (let i = 0; i < displayCount; i++) {
        const title = shuffled[i].title.length > 30 
          ? shuffled[i].title.substring(0, 30) + '...' 
          : shuffled[i].title
        context.fillText(`📖 ${title}`, 256, 85 + i * 25)
      }
    }

    const texture = new THREE.CanvasTexture(canvas)
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true })
    const sprite = new THREE.Sprite(material)
    sprite.scale.set(4, 1, 1)
    group.add(sprite)

    return group
  }

  const createCenterTitle = (palaceName) => {
    const scene = sceneRef.current
    if (!scene) return

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = 1024
    canvas.height = 256

    // 渐变背景
    const gradient = context.createLinearGradient(0, 0, 1024, 256)
    gradient.addColorStop(0, 'rgba(0, 255, 255, 0.1)')
    gradient.addColorStop(0.5, 'rgba(128, 0, 255, 0.1)')
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0.1)')
    context.fillStyle = gradient
    context.fillRect(0, 0, 1024, 256)

    // 标题
    context.fillStyle = '#ffffff'
    context.font = 'bold 72px Arial'
    context.textAlign = 'center'
    context.shadowColor = '#00ffff'
    context.shadowBlur = 20
    context.fillText(palaceName, 512, 120)

    // 副标题
    context.font = '36px Arial'
    context.fillStyle = '#00ffff'
    context.shadowColor = '#ff00ff'
    context.fillText('点击书架进入', 512, 180)

    const texture = new THREE.CanvasTexture(canvas)
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true })
    const sprite = new THREE.Sprite(material)
    sprite.scale.set(8, 2, 1)
    sprite.position.set(0, 4, 0)
    scene.add(sprite)
  }

  const animate = () => {
    requestAnimationFrame(animate)

    const time = Date.now() * 0.001

    // 浮动动画
    roomsRef.current.forEach((room, index) => {
      room.position.y = Math.sin(time + room.userData.floatOffset) * 0.2
      room.rotation.y += 0.002
    })

    // 相机旋转
    if (cameraRef.current) {
      const camera = cameraRef.current
      const radius = 8
      camera.position.x = Math.sin(rotationRef.current.y) * radius
      camera.position.z = Math.cos(rotationRef.current.y) * radius
      camera.position.y = 3 + rotationRef.current.x * 0.5
      camera.lookAt(0, 0, 0)
    }

    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current)
    }
  }

  // 鼠标事件处理
  const handleMouseDown = (e) => {
    isDragging.current = true
    previousMousePosition.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseMove = (e) => {
    if (!isDragging.current) return

    const deltaX = e.clientX - previousMousePosition.current.x
    const deltaY = e.clientY - previousMousePosition.current.y

    rotationRef.current.y -= deltaX * 0.005
    rotationRef.current.x += deltaY * 0.005
    rotationRef.current.x = Math.max(-1, Math.min(1, rotationRef.current.x))

    previousMousePosition.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  const handleWheel = (e) => {
    if (!cameraRef.current) return
    // 缩放逻辑可以在这里添加
  }

  // 触摸事件处理
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      isDragging.current = true
      previousMousePosition.current = { 
        x: e.touches[0].clientX, 
        y: e.touches[0].clientY 
      }
    }
  }

  const handleTouchMove = (e) => {
    if (!isDragging.current || e.touches.length !== 1) return
    e.preventDefault()

    const deltaX = e.touches[0].clientX - previousMousePosition.current.x
    const deltaY = e.touches[0].clientY - previousMousePosition.current.y

    rotationRef.current.y -= deltaX * 0.005
    rotationRef.current.x += deltaY * 0.005
    rotationRef.current.x = Math.max(-1, Math.min(1, rotationRef.current.x))

    previousMousePosition.current = { 
      x: e.touches[0].clientX, 
      y: e.touches[0].clientY 
    }
  }

  const handleTouchEnd = () => {
    isDragging.current = false
  }

  return (
    <div className="relative w-full h-screen" ref={containerRef}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="text-white text-lg animate-pulse">🏰 正在构建图书馆...</div>
        </div>
      )}
      
      {/* 操作提示 */}
      <div className="absolute bottom-4 left-4 ios-card px-4 py-2 z-10 pointer-events-none">
        <p className="text-white/70 text-xs">
          🖱️ 拖拽旋转视角 · 📱 触摸滑动
        </p>
      </div>

      {/* 房间列表（备用） */}
      <div className="absolute top-4 right-4 ios-card p-4 z-10 max-h-64 overflow-y-auto">
        <h3 className="text-white font-semibold mb-2 text-sm">📚 书架列表</h3>
        {palace?.rooms?.map(room => (
          <button
            key={room.id}
            onClick={() => onRoomClick && onRoomClick(room.id)}
            className="block w-full text-left text-white/70 hover:text-white text-xs py-1 transition-colors"
          >
            {room.name} ({room.memories?.length || 0}本书)
          </button>
        ))}
      </div>
    </div>
  )
}

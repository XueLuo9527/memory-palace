import { useEffect, useState } from 'react'

/**
 * 3D 粒子背景组件
 * 营造沉浸式空间感
 */
export default function ParticleBackground({ count = 20 }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    // 生成随机粒子
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.2
    }))
    setParticles(newParticles)
  }, [count])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            background: `radial-gradient(circle, rgba(138, 43, 226, ${particle.opacity}) 0%, transparent 70%)`
          }}
        />
      ))}
    </div>
  )
}

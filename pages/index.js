import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { getCurrentUser, logout } from '../lib/auth'

export default function Home() {
  const [user, setUser] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setUser(getCurrentUser())
  }, [])

  if (!mounted) return null

  return (
    <>
      <Head>
        <title>记忆宫殿 - Memory Palace</title>
        <meta name="description" content="你的可视化知识管理系统" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>

      <div className="tech-bg min-h-screen flex flex-col">
        {/* 扫描线效果 */}
        <div className="scan-line fixed top-0 left-0 right-0 z-50 pointer-events-none" />
        
        {/* 头部导航 */}
        <header className="glass-panel sticky top-0 z-40 border-b-0">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg animate-pulse-glow">
                🏰
              </div>
              <span className="text-white font-semibold text-lg hidden sm:block">Memory Palace</span>
            </div>
            
            {user && (
              <div className="flex items-center gap-4">
                <div className="ios-card px-4 py-2 flex items-center gap-2">
                  <span className="text-white/80 text-sm">👤 {user.name}</span>
                </div>
                <button
                  onClick={() => {
                    logout()
                    window.location.reload()
                  }}
                  className="text-white/60 hover:text-white text-sm transition-colors btn-press"
                >
                  退出
                </button>
              </div>
            )}
          </div>
        </header>

        {/* 主内容区 */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* 标题 - 科技感 */}
            <div className="animate-fade-in-up mb-8">
              <div className="inline-flex items-center gap-2 ios-card px-4 py-2 mb-6">
                <span className="tech-dot" />
                <span className="text-white/70 text-sm uppercase tracking-wider">Personal Knowledge System</span>
              </div>
              
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 neon-glow">
                记忆宫殿
              </h1>
              <p className="text-xl sm:text-2xl text-white/60 font-light">
                把你的知识，<span className="text-gradient">放进图书馆里</span>
              </p>
            </div>

            {/* 科技感分隔线 */}
            <div className="tech-line max-w-md mx-auto mb-12" />

            {/* 特性展示 - iOS 风格卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12">
              <FeatureCard
                icon="📚"
                title="图书馆隐喻"
                description="像整理书籍一样整理知识"
                delay={0}
              />
              <FeatureCard
                icon="✨"
                title="空间化记忆"
                description="用位置记住一切"
                delay={100}
              />
              <FeatureCard
                icon="🔮"
                title="智能关联"
                description="发现知识的隐藏联系"
                delay={200}
              />
            </div>

            {/* CTA 按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              {user ? (
                <Link href="/palaces">
                  <button className="ios-button min-w-[200px]">
                    📖 进入图书馆
                  </button>
                </Link>
              ) : (
                <Link href="/login">
                  <button className="ios-button min-w-[200px]">
                    🚀 开始使用
                  </button>
                </Link>
              )}
            </div>

            {/* 版本信息 */}
            <p className="text-white/40 text-xs mt-8">
              v0.8.1 · 图书馆书架风格
            </p>
          </div>
        </main>

        {/* 底部 */}
        <footer className="glass-panel border-t-0 py-6">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-white/40 text-sm">
              Memory Palace © 2026 · 你的可视化知识管理系统
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}

function FeatureCard({ icon, title, description, delay }) {
  return (
    <div 
      className="ios-card p-6 text-left animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-white/60 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

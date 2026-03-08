import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { getCurrentUser, logout } from '../lib/auth'

export default function Home() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  return (
    <div className={styles.container}>
      <Head>
        <title>记忆宫殿 - Memory Palace</title>
        <meta name="description" content="你的可视化知识管理系统" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          🏰 记忆宫殿
        </h1>
        <p className={styles.description}>
          把你的知识，放进宫殿里
        </p>

        {/* 用户信息 */}
        {user && (
          <div className="mb-8 flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <span className="text-white/80">👤 {user.name}</span>
            </div>
            <button
              onClick={() => {
                logout()
                window.location.reload()
              }}
              className="text-white/60 hover:text-white text-sm transition-colors"
            >
              退出
            </button>
          </div>
        )}

        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.icon}>🧠</span>
            <h3>空间化记忆</h3>
            <p>利用位置记忆法，让知识更有组织</p>
          </div>
          <div className={styles.feature}>
            <span className={styles.icon}>🎨</span>
            <h3>视觉化呈现</h3>
            <p>告别枯燥列表，用空间管理信息</p>
          </div>
          <div className={styles.feature}>
            <span className={styles.icon}>🔗</span>
            <h3>智能关联</h3>
            <p>自动发现知识之间的联系</p>
          </div>
        </div>

        <div className={styles.cta}>
          {user ? (
            <Link href="/palaces">
              <button className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg font-medium transition-all backdrop-blur-sm border border-white/30 text-lg">
                🚀 进入我的宫殿
              </button>
            </Link>
          ) : (
            <Link href="/login">
              <button className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg font-medium transition-all backdrop-blur-sm border border-white/30 text-lg">
                👤 开始使用
              </button>
            </Link>
          )}
          <p className="text-white/60 text-sm mt-4">v0.5.0 - 用户认证系统</p>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Memory Palace © 2026 - 你的可视化知识管理系统</p>
      </footer>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    textAlign: 'center',
  },
  title: {
    fontSize: '4rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '1rem',
    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
  },
  description: {
    fontSize: '1.5rem',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: '3rem',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    maxWidth: '900px',
    width: '100%',
    marginBottom: '3rem',
  },
  feature: {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '1rem',
    padding: '2rem',
    border: '1px solid rgba(255,255,255,0.2)',
    transition: 'all 0.3s ease',
  },
  icon: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '1rem',
  },
  cta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  footer: {
    padding: '2rem',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.875rem',
  },
}

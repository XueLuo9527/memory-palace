import { useEffect, useState, createContext, useContext } from 'react'
import { useRouter } from 'next/router'
import '../styles/globals.css'

// 用户上下文
export const UserContext = createContext(null)

// 使用用户上下文
export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}

// 用户提供者组件
function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // 初始化时检查用户登录状态
  useEffect(() => {
    checkAuth()
    
    // 监听存储变化（多标签页同步）
    const handleStorageChange = (e) => {
      if (e.key === 'memory-palace-user') {
        if (e.newValue) {
          setUser(JSON.parse(e.newValue))
        } else {
          setUser(null)
        }
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // 检查认证状态
  async function checkAuth() {
    try {
      const storedUser = localStorage.getItem('memory-palace-user')
      const storedSession = localStorage.getItem('memory-palace-session')
      
      if (storedUser && storedSession) {
        const session = JSON.parse(storedSession)
        
        // 检查会话是否过期
        if (session.expiresAt && session.expiresAt * 1000 < Date.now()) {
          // 会话过期，尝试刷新
          const refreshed = await refreshSession()
          if (refreshed) {
            setUser(JSON.parse(storedUser))
          } else {
            localStorage.removeItem('memory-palace-user')
            localStorage.removeItem('memory-palace-session')
          }
        } else {
          setUser(JSON.parse(storedUser))
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 刷新会话
  async function refreshSession() {
    try {
      const storedSession = localStorage.getItem('memory-palace-session')
      if (!storedSession) return false
      
      const session = JSON.parse(storedSession)
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: session.refreshToken })
      })
      
      if (!res.ok) return false
      
      const result = await res.json()
      if (result.data?.session) {
        localStorage.setItem('memory-palace-session', JSON.stringify(result.data.session))
        return true
      }
      return false
    } catch (error) {
      console.error('Refresh error:', error)
      return false
    }
  }

  // 登录
  async function login(userData, sessionData) {
    localStorage.setItem('memory-palace-user', JSON.stringify(userData))
    localStorage.setItem('memory-palace-session', JSON.stringify(sessionData))
    setUser(userData)
  }

  // 登出
  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    localStorage.removeItem('memory-palace-user')
    localStorage.removeItem('memory-palace-session')
    setUser(null)
    router.push('/login')
  }

  // 需要登录时重定向
  useEffect(() => {
    if (!loading && !user && !['/login', '/'].includes(router.pathname)) {
      router.push('/login')
    }
  }, [user, loading, router.pathname])

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export default function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  )
}

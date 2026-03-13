import { useEffect, useState, createContext } from 'react'
import { useRouter } from 'next/router'
import '../styles/globals.css'
import { getCurrentUser, logout as authLogout } from '../lib/auth'

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

  // 检查认证状态（localStorage 模式）
  function checkAuth() {
    try {
      const storedUser = localStorage.getItem('memory-palace-user')
      
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Auth check error:', error)
      setLoading(false)
    }
  }

  // 登录
  async function login(name) {
    const user = {
      id: 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      createdAt: new Date().toISOString()
    }
    
    setUser(user)
    localStorage.setItem('memory-palace-user', JSON.stringify(user))
    return user
  }

  // 退出登录
  function logout() {
    setUser(null)
    authLogout()
    router.push('/login')
  }

  const value = {
    user,
    loading,
    login,
    logout
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export default function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  )
}

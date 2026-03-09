import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { getCurrentUser, logout } from '../lib/auth'

export default function Settings() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [mergeMode, setMergeMode] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
  }, [router])

  const handleExport = async (palaceId = null) => {
    if (!user) return

    const url = palaceId
      ? `/api/export?userId=${user.id}&palaceId=${palaceId}`
      : `/api/export?userId=${user.id}`

    // 触发文件下载
    window.open(url, '_blank')
  }

  const handleImport = async (event) => {
    const file = event.target.files[0]
    if (!file || !user) return

    setImporting(true)
    setImportResult(null)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result)
          
          const res = await fetch('/api/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              data,
              merge: mergeMode
            })
          })

          const result = await res.json()
          setImportResult(result)

          if (result.success) {
            alert(`导入成功！\n${result.message}`)
            router.push('/palaces')
          } else {
            alert(`导入失败：${result.error}\n\n${result.message || ''}`)
          }
        } catch (error) {
          setImportResult({ error: '文件解析失败', message: error.message })
          alert('文件解析失败：' + error.message)
        } finally {
          setImporting(false)
        }
      }
      reader.readAsText(file)
    } catch (error) {
      setImporting(false)
      alert('读取文件失败：' + error.message)
    }
  }

  const handleLogout = () => {
    if (!confirm('确定要退出登录吗？')) return
    logout()
    router.push('/login')
  }

  return (
    <>
      <Head>
        <title>设置 - 记忆宫殿</title>
      </Head>

      <div className="min-h-screen p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          {/* 头部 */}
          <div className="flex justify-between items-center mb-8">
            <Link href="/palaces" className="text-white/80 hover:text-white text-sm sm:text-base">
              ← 返回宫殿列表
            </Link>
            {user && (
              <div className="flex items-center gap-4">
                <span className="text-white/80 text-xs sm:text-sm">👤 {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-white/60 hover:text-white text-xs sm:text-sm transition-colors"
                >
                  退出
                </button>
              </div>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-8">⚙️ 设置</h1>

          {/* 数据管理 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">📦 数据管理</h2>

            {/* 导出 */}
            <div className="mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">导出</h3>
              <p className="text-white/60 text-xs sm:text-sm mb-4">
                将你的宫殿数据导出为 JSON 文件，可用于备份或迁移
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleExport()}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all backdrop-blur-sm border border-white/30 text-sm sm:text-base"
                >
                  📥 导出全部数据
                </button>
              </div>
            </div>

            {/* 导入 */}
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">导入</h3>
              <p className="text-white/60 text-xs sm:text-sm mb-4">
                从 JSON 文件恢复宫殿数据
                <span className="text-red-300 ml-2">⚠️ 导入会覆盖现有数据（合并模式除外）</span>
              </p>

              <div className="mb-4">
                <label className="flex items-center gap-2 text-white/80 text-sm sm:text-base cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mergeMode}
                    onChange={(e) => setMergeMode(e.target.checked)}
                    className="w-4 h-4"
                  />
                  合并模式（保留现有数据，添加导入的数据）
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <label className="bg-white/20 hover:bg-white/30 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all backdrop-blur-sm border border-white/30 text-sm sm:text-base cursor-pointer">
                  📤 选择文件
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    disabled={importing}
                    className="hidden"
                  />
                </label>
                {importing && (
                  <span className="text-white/80 text-sm">导入中...</span>
                )}
              </div>

              {importResult && !importResult.success && (
                <div className="mt-4 bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                  <p className="text-red-200 text-sm">
                    <strong>错误:</strong> {importResult.error}
                  </p>
                  {importResult.message && (
                    <p className="text-red-300/80 text-xs mt-2">{importResult.message}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 关于 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">ℹ️ 关于</h2>
            <div className="text-white/70 text-sm sm:text-base space-y-2">
              <p><strong>项目名称:</strong> Memory Palace（记忆宫殿）</p>
              <p><strong>版本:</strong> v0.7.0</p>
              <p><strong>技术栈:</strong> Next.js + React + Tailwind CSS + Supabase</p>
              <p><strong>GitHub:</strong> <a href="https://github.com/XueLuo9527/memory-palace" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white underline">XueLuo9527/memory-palace</a></p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

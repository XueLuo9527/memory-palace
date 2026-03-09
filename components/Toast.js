import { useEffect, useState } from 'react'

/**
 * Toast 提示组件
 * @param {string} message - 提示内容
 * @param {string} type - 类型：success, error, info, warning
 * @param {number} duration - 显示时长（毫秒）
 * @param {function} onClose - 关闭回调
 */
export default function Toast({ message, type = 'info', duration = 3000, onClose }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const typeStyles = {
    success: 'bg-green-500/90 border-green-400',
    error: 'bg-red-500/90 border-red-400',
    warning: 'bg-yellow-500/90 border-yellow-400',
    info: 'bg-blue-500/90 border-blue-400'
  }

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }

  if (!visible || !message) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-slide-down">
      <div className={`${typeStyles[type]} border rounded-lg px-6 py-3 shadow-lg backdrop-blur-sm`}>
        <div className="flex items-center gap-3">
          <span className="text-lg">{icons[type]}</span>
          <span className="text-white font-medium text-sm sm:text-base">{message}</span>
        </div>
      </div>
    </div>
  )
}

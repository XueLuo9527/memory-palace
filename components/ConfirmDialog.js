import { useState } from 'react'

/**
 * 确认对话框组件
 * @param {boolean} isOpen - 是否显示
 * @param {string} title - 标题
 * @param {string} message - 确认内容
 * @param {string} confirmText - 确认按钮文字
 * @param {string} cancelText - 取消按钮文字
 * @param {string} type - 类型：danger, warning, info
 * @param {function} onConfirm - 确认回调
 * @param {function} onCancel - 取消回调
 */
export default function ConfirmDialog({
  isOpen = false,
  title = '确认操作',
  message,
  confirmText = '确认',
  cancelText = '取消',
  type = 'info',
  onConfirm,
  onCancel
}) {
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const typeStyles = {
    danger: 'bg-red-500/20 border-red-500/50',
    warning: 'bg-yellow-500/20 border-yellow-500/50',
    info: 'bg-blue-500/20 border-blue-500/50'
  }

  const confirmTypeStyles = {
    danger: 'bg-red-500 hover:bg-red-600',
    warning: 'bg-yellow-500 hover:bg-yellow-600',
    info: 'bg-blue-500 hover:bg-blue-600'
  }

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[99] animate-fade-in">
      <div 
        className={`${typeStyles[type]} border rounded-xl p-6 max-w-sm w-full animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-white/80 text-sm mb-6">{message}</p>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-white px-4 py-3 rounded-lg font-medium transition-all backdrop-blur-sm border border-white/30 text-sm"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 ${confirmTypeStyles[type]} disabled:opacity-50 text-white px-4 py-3 rounded-lg font-medium transition-all text-sm btn-click`}
          >
            {loading ? '处理中...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'

/**
 * 书架组件 - 图书馆风格
 * 展示书本（记忆）在书架上的效果
 */
export default function BookShelf({ memories = [], onBookClick, onAddBook }) {
  const [hoveredBook, setHoveredBook] = useState(null)

  // 将记忆分组到书架行（每行最多 8 本书）
  const booksPerRow = 8
  const shelves = []
  for (let i = 0; i < memories.length; i += booksPerRow) {
    shelves.push(memories.slice(i, i + booksPerRow))
  }

  if (memories.length === 0) {
    return (
      <div className="empty-shelf" onClick={onAddBook}>
        <div className="text-6xl mb-4 animate-float-3d">📖</div>
        <p className="text-lg font-semibold mb-2">书架是空的</p>
        <p className="text-white/50 text-sm mb-4">点击添加第一本书</p>
        <button className="ios-button-secondary px-6 py-3 rounded-xl btn-press">
          + 添加书籍
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 书架标签 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="tech-dot" />
          <span className="text-white/60 text-sm uppercase tracking-wider">
            {memories.length} 本书
          </span>
        </div>
        {onAddBook && (
          <button 
            onClick={onAddBook}
            className="ios-button-secondary px-4 py-2 rounded-xl text-sm btn-press"
          >
            + 添加书籍
          </button>
        )}
      </div>

      {/* 书架行 */}
      <div className="space-y-6">
        {shelves.map((shelfBooks, shelfIndex) => (
          <div key={shelfIndex} className="shelf-row rounded-xl animate-book-place" style={{ animationDelay: `${shelfIndex * 100}ms` }}>
            {shelfBooks.map((book, bookIndex) => (
              <BookSpine
                key={book.id || bookIndex}
                book={book}
                index={bookIndex}
                isHovered={hoveredBook === book.id}
                onHover={setHoveredBook}
                onClick={() => onBookClick?.(book)}
              />
            ))}
            
            {/* 空位填充 */}
            {Array.from({ length: booksPerRow - shelfBooks.length }).map((_, i) => (
              <div key={`empty-${i}`} className="min-w-[60px]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * 书脊组件 - 单本书的展示
 */
function BookSpine({ book, index, isHovered, onHover, onClick }) {
  // 根据索引生成不同的书脊颜色
  const colors = [
    'from-cyan-500 to-blue-600',
    'from-purple-500 to-indigo-600',
    'from-pink-500 to-rose-600',
    'from-amber-500 to-orange-600',
    'from-emerald-500 to-teal-600',
    'from-violet-500 to-purple-600',
  ]
  
  const colorClass = colors[index % colors.length]
  
  return (
    <div
      className="animate-book-place"
      style={{ animationDelay: `${index * 50}ms` }}
      onMouseEnter={() => onHover?.(book.id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={onClick}
    >
      <div 
        className={`
          book-spine
          bg-gradient-to-b ${colorClass}
          relative overflow-hidden
          neon-border
        `}
        style={{
          minWidth: '64px',
          maxWidth: '72px',
          height: '120px',
        }}
      >
        {/* 书脊装饰线 */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-px bg-white/30" />
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-4 h-px bg-white/30" />
        
        {/* 书名（垂直） */}
        <div className="book-spine-label flex-1 py-2">
          {book.title || '无题'}
        </div>
        
        {/* 悬停提示 */}
        {isHovered && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 glass-panel rounded-lg text-xs text-white whitespace-nowrap z-10 animate-fade-in-up">
            <div className="font-semibold mb-1">{book.title || '无题'}</div>
            {book.content && (
              <div className="text-white/60 max-w-[200px] truncate">
                {book.content}
              </div>
            )}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 glass-panel border-r border-b border-white/10" />
          </div>
        )}
        
        {/* 光泽效果 */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5 pointer-events-none" />
      </div>
    </div>
  )
}

/**
 * 书籍详情模态框
 */
export function BookDetailModal({ book, onClose, onEdit, onDelete }) {
  if (!book) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-panel rounded-2xl p-6 sm:p-8 max-w-lg w-full animate-scale-in border border-white/10 max-h-[80vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-2xl">
              📖
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{book.title || '无题'}</h2>
              <p className="text-white/50 text-sm">
                {book.createdAt ? new Date(book.createdAt).toLocaleDateString('zh-CN') : '未知日期'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-2xl transition-colors btn-press"
          >
            ×
          </button>
        </div>

        {/* 内容区 */}
        <div className="ios-card bg-white/5 rounded-xl p-4 mb-6">
          <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
            {book.content || '暂无内容'}
          </p>
        </div>

        {/* 标签 */}
        {book.tags && book.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {book.tags.map((tag, i) => (
              <span 
                key={i}
                className="px-3 py-1 ios-card text-xs text-white/70"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-3">
          {onEdit && (
            <button
              onClick={() => onEdit(book)}
              className="flex-1 ios-button-secondary py-3 rounded-xl font-medium btn-press"
            >
              ✏️ 编辑
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(book)}
              className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-3 rounded-xl font-medium transition-colors btn-press"
            >
              🗑️ 删除
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

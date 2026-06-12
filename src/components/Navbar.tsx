import { Link, useNavigate } from 'react-router-dom'
import { MessageSquare, BookOpen } from 'lucide-react'
import { useStore } from '@/store'

export default function Navbar() {
  const { token, adminName, clearAuth } = useStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-[90px] flex items-center"
      style={{
        background: 'rgba(250,250,250,0.8)',
        backdropFilter: 'saturate(200%) blur(30px)',
        WebkitBackdropFilter: 'saturate(200%) blur(30px)',
      }}
    >
      <div className="w-full max-w-[1600px] mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="block h-[40px]">
          <img src="/images/logo.svg" alt="新文艺" className="h-[40px] w-auto" />
        </Link>

        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-1 text-sm text-text-link hover:text-text-main transition-all duration-300"
          >
            <img src="/images/message.svg" alt="留言" className="w-[28px] h-[28px]" />
          </Link>
          <Link
            to="/yiyan"
            className="flex items-center gap-1 text-sm text-text-link hover:text-text-main transition-all duration-300"
          >
            <img src="/images/blog.svg" alt="一言" className="w-[28px] h-[28px]" />
          </Link>
          {token && (
            <>
              <span className="text-xs text-muted">管理员: {adminName}</span>
              <button
                onClick={handleLogout}
                className="text-xs text-muted hover:text-red-500 transition-all duration-300"
              >
                退出
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

import { useSearchParams, Link } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Announcement from '@/components/Announcement'
import MessageForm from '@/components/MessageForm'
import MessageList from '@/components/MessageList'
import Sidebar from '@/components/Sidebar'
import BackToTop from '@/components/BackToTop'

const recommendLinks = ['哈哈', '文艺社区', '一言', '摄影', '手机壁纸']

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const so = searchParams.get('so') || ''

  const handlePostSuccess = () => {
    window.dispatchEvent(new CustomEvent('message-posted'))
  }

  const handleSidebarSearch = (keyword: string) => {
    const params = new URLSearchParams()
    params.set('so', keyword)
    setSearchParams(params)
  }

  const handleClearSearch = () => {
    setSearchParams({})
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <main className="max-w-[1600px] mx-auto px-6 pt-[106px] pb-12 bg-[#FAFAFA]">
        <div className="mx-auto">
          <div className="flex gap-6">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              <MessageForm onSuccess={handlePostSuccess} />

              {/* Recommend links bar */}
              <div className="flex items-center gap-3 my-4 text-sm">
                <span className="text-muted">推荐:</span>
                {recommendLinks.map((link) => (
                  <button
                    key={link}
                    onClick={() => handleSidebarSearch(link)}
                    className="text-text-link hover:text-accent transition-all duration-300"
                  >
                    {link}
                  </button>
                ))}
              </div>

              <Announcement />
              <MessageList />
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block w-[260px] flex-shrink-0 overflow-visible">
              <div className="sticky top-[106px] overflow-visible">
                <Sidebar
                  onSearch={handleSidebarSearch}
                  searchKeyword={so || undefined}
                  onClearSearch={handleClearSearch}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <BackToTop />
      {/* Footer */}
      <footer className="py-8 text-center bg-[#FAFAFA]">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center justify-center gap-4 mb-3">
            <a href="https://xinwenyi.com" target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-accent transition-all duration-300">关于</a>
            <span className="text-text-light">|</span>
            <a href="https://xinwenyi.com/yiyan.php" target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-accent transition-all duration-300">一言</a>
            <span className="text-text-light">|</span>
            <a href="#" className="text-sm text-muted hover:text-accent transition-all duration-300">联系</a>
            <span className="text-text-light">|</span>
            <Link to="/login" className="text-sm text-muted hover:text-accent transition-all duration-300">管理</Link>
          </div>
          <p className="text-xs text-text-light">Copyright © 新文艺. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default function Announcement() {
  return (
    <div className="message-card bg-white rounded-card pt-[25px] px-5 pb-[30px] mb-4 relative">
      <div className="flex">
        {/* Left - admin avatar */}
        <div className="w-[80px] flex-shrink-0">
          <img
            src="/images/v8/g.jpg"
            alt="管理员"
            className="w-[52px] h-[52px] rounded-full object-cover"
          />
        </div>

        {/* Right - content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-bold text-text-main" style={{ fontSize: '16px' }}>公告:</span>
              <span className="text-text-main ml-1" style={{ fontSize: '16px', lineHeight: '30px' }}>
                心有山海，静而无边。 WeChat：
                <span className="text-[#0f9960]">nb003521</span>
              </span>
            </div>
            <span
              className="text-[#e9e9e9] select-none font-sans flex-shrink-0 ml-2"
              style={{ fontSize: '36px', lineHeight: '1' }}
            >
              置顶
            </span>
          </div>
          <span className="text-sm text-muted mt-1 inline-block">视觉符号</span>
        </div>
      </div>
    </div>
  )
}

// Emoji 映射表：key -> GIF 图片路径（与原版一致）
export const emojiMap: Record<string, string> = {
  '[微笑]': '/images/six/bq/wx.gif',
  '[晕]': '/images/six/bq/y.gif',
  '[心花怒放]': '/images/six/bq/xhnf.gif',
  '[鼓掌]': '/images/six/bq/gz.gif',
  '[哈欠]': '/images/six/bq/hax.gif',
  '[憨笑]': '/images/six/bq/sx.gif',
  '[汗]': '/images/six/bq/han.gif',
  '[吃惊]': '/images/six/bq/cj.gif',
  '[鄙视]': '/images/six/bq/bs.gif',
  '[闭嘴]': '/images/six/bq/bz.gif',
  '[呲牙]': '/images/six/bq/cy.gif',
  '[害羞]': '/images/six/bq/hx.gif',
  '[衰]': '/images/six/bq/shuai.gif',
  '[偷笑]': '/images/six/bq/tx.gif',
  '[折磨]': '/images/six/bq/zm.gif',
  '[难过]': '/images/six/bq/ng.gif',
  '[示爱]': '/images/six/bq/sa.gif',
  '[可爱]': '/images/six/bq/ka.gif',
  '[泪]': '/images/six/bq/lei.gif',
  '[酷]': '/images/six/bq/cool.gif',
  '[发呆]': '/images/six/bq/fd.gif',
  '[强]': '/images/six/bq/qiang.gif',
  '[敲打]': '/images/six/bq/qd.gif',
  '[再见]': '/images/six/bq/zj.gif',
}

// 所有 emoji key 列表，用于 emoji 选择器
export const emojiKeys = Object.keys(emojiMap)

// 将文本中的 emoji 标记替换为 <img> 标签
export function replaceEmojis(text: string): string {
  return text.replace(/\[[^\]]+\]/g, (match) => {
    const src = emojiMap[match]
    if (src) {
      return `<img src="${src}" alt="${match}" style="height:18px;margin-bottom:-3px;margin-left:2px;margin-right:2px;vertical-align:middle;" />`
    }
    return match
  })
}

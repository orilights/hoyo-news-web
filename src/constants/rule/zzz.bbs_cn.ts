export default {
  '壁纸': {
    keyword: ['壁纸', '影像档案'],
  },
  '周边信息': {
    keyword: ['新品情报', '周边展示'],
  },
  '版本PV': {
    keyword: ['版本PV'],
    meta: { video: true },
  },
  '版本更新说明': {
    keyword: [/^(?!.*云).*更新说明/],
  },
  '版本更新通知': {
    keyword: [/版本.*更新通知/],
  },
  '前瞻回顾长图': {
    keyword: ['情报总览', '回顾长图'],
  },
  '前瞻预告': {
    keyword: ['前瞻特别节目预告'],
  },
  '前瞻特别节目': {
    keyword: ['前瞻特别节目'],
    exclude: ['bbs_cn.59963776'],
    meta: { video: true },
  },
  '丽都修葺漫谈': {
    keyword: ['丽都修葺漫谈'],
  },
  '策划面对面': {
    keyword: ['策划面对面'],
    meta: { video: true },
  },
  '幕后花絮': {
    keyword: ['幕后'],
    meta: { video: true },
  },
  '代理人档案': {
    keyword: ['代理人档案'],
  },
  '代理人机制介绍': {
    keyword: ['代理人机制介绍'],
  },
  '代理人采访手记': {
    keyword: ['采访手记'],
  },
  '角色头像': {
    keyword: ['角色头像'],
  },
  '角色展示': {
    keyword: ['角色展示'],
    meta: { video: true },
  },
  '代理人战斗情报': {
    keyword: ['代理人战斗情报'],
    meta: { video: true },
  },
  '角色PV': {
    keyword: ['角色PV'],
    meta: { video: true },
  },
  '动画短片': {
    keyword: ['动画短片'],
    meta: { video: true },
  },
  '过场动画': {
    keyword: ['过场动画'],
    meta: { video: true },
  },
  'PV': {
    keyword: ['PV'],
    meta: { video: true },
    filter: { video: true },
  },
  'EP上架': {
    keyword: [/EP.*上架/],
  },
  'EP、MV': {
    keyword: ['EP', 'MV'],
    meta: { video: true },
    filter: { video: true },
  },
  '日常影像': {
    keyword: ['日常影像'],
    meta: { video: true },
  },
  '参展视频': {
    keyword: [/gamescom/i, 'TGA', 'TGS'],
    meta: { video: true },
    filter: { video: true },
  },
  '主线更新': {
    keyword: [/新剧情.*主线/],
  },
  '独家视界更新': {
    keyword: ['独家视界开启'],
  },
  '代理人秘闻更新': {
    keyword: [/新剧情.*代理人秘闻/],
  },
  '生日贺图': {
    keyword: ['生日快乐'],
  },
  '时装杂志': {
    keyword: ['New Eridan'],
  },
  '过塑手账': {
    keyword: ['过塑手账'],
  },
  '丽都放大镜': {
    keyword: ['丽都放大镜'],
  },
  '新艾利都探店': {
    keyword: ['新艾利都探店'],
  },
  '六分街街头异闻': {
    keyword: ['六分街街头异闻'],
  },
  '邦布们的说明书': {
    keyword: [/邦布.*说明书/],
  },
  '表情包': {
    keyword: ['表情包'],
  },
  '活动说明': {
    keyword: ['活动说明'],
  },
  '网页活动': {
    keyword: ['网页活动', 'H5'],
  },
  '电玩店上新': {
    keyword: ['电玩店上新'],
  },
  '调频说明': {
    keyword: ['调频说明', '限时频段'],
  },
  '音擎上新': {
    keyword: ['音擎上新'],
  },
  '邦布上新': {
    keyword: ['卓越搭档'],
  },
  '布后花絮': {
    keyword: ['布后花絮'],
    meta: { video: true },
  },
  '不可售影像': {
    keyword: ['不可售影像'],
    meta: { video: true },
  },
  '独家频段': {
    keyword: ['独家频段'],
    meta: { video: true },
  },
  '独家纪闻': {
    keyword: ['独家纪闻'],
    meta: { video: true },
  },
  '未分类视频': {
    keyword: [/.*/],
    meta: { video: true },
    filter: { video: true },
  },
} as SourceClassifyRule

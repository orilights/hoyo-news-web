export default {
  '壁纸': {
    keyword: ['壁纸'],
    include: [],
    exclude: [],
  },
  '网页活动': {
    keyword: ['H5', '网页活动'],
    include: [],
    exclude: [],
  },
  'OST': {
    keyword: [/OST.*上线/],
    include: [],
    exclude: [],
  },
  '新区域展示页': {
    keyword: ['新区域展示页'],
    include: [],
    exclude: [],
  },
  '武器活动祈愿': {
    keyword: ['神铸赋形'],
    include: [],
    exclude: [],
  },
  '集录祈愿': {
    keyword: ['集录祈愿'],
    include: [],
    exclude: [],
  },
  '角色活动祈愿': {
    keyword: ['祈愿即将开启', '祈愿现已开启', '活动祈愿'],
    include: [],
    exclude: [],
  },
  '表情包': {
    keyword: ['表情包'],
    include: [],
    exclude: [],
  },
  '提瓦特美食札记': {
    keyword: ['提瓦特美食札记'],
    include: [116321, 116345, 116353, 116362, 116381],
    exclude: [],
  },
  '生日贺图': {
    keyword: ['生日贺图', /生日.*快乐/],
    include: [116277],
    exclude: [117793],
  },
  '音乐会': {
    keyword: ['音乐会'],
    include: [],
    exclude: [],
  },
  '交响音乐现场': {
    keyword: ['交响音乐现场'],
    include: [],
    exclude: [],
  },
  'EP、MV': {
    keyword: ['音乐动态视频', '《原神》EP', '特别EP', 'MV', '主题曲'],
    include: [],
    exclude: [],
  },
  '版本PV': {
    keyword: [/\d\.\d版本PV/],
    include: [],
    exclude: [],
  },
  '活动汇总': {
    keyword: ['活动汇总'],
    include: [],
    exclude: [],
  },
  '前瞻预告': {
    keyword: [/特别节目.*即将开启/, '前瞻直播预告', '前瞻特别节目预告'],
    include: [118577, 118573],
    exclude: [],
  },
  '前瞻回顾长图': {
    keyword: [/(前瞻|特别节目).*回顾长图/],
    include: [],
    exclude: [],
  },
  '前瞻直播': {
    keyword: ['特别节目'],
    include: [116318],
    exclude: [],
    filter: {
      video: true,
    },
  },
  '版本更新说明': {
    keyword: ['更新通知', /版本.*更新说明/, '更新维护预告'],
    include: [],
    exclude: [],
  },
  '版本专题页': {
    keyword: ['内容专题页', '先行展示页', '版本内容页'],
    include: [],
    exclude: [],
  },
  '版本活动速递': {
    keyword: ['版本活动速递'],
    include: [],
    exclude: [],
  },
  '幕后花絮': {
    keyword: ['的幕后', '幕后的故事', '合作幕后'],
    include: [],
    exclude: [],
  },
  '沙雕广告': {
    keyword: ['原来你也玩原神', '《云·原神》动画短片'],
    include: [],
    exclude: [],
  },
  '漫画': {
    keyword: ['条漫', '四格漫画'],
    include: [],
    exclude: [],
  },
  '声优小剧场': {
    keyword: ['声优小剧场', '璃月雅集'],
    include: [],
    exclude: [],
  },
  '寻味之旅': {
    keyword: ['寻味之旅'],
    include: [],
    exclude: [],
  },
  'PV短片': {
    keyword: ['PV短片'],
    include: [],
    exclude: [],
  },
  '动画短片': {
    keyword: ['动画短片'],
    include: [],
    exclude: [],
  },
  '风物集短片': {
    keyword: ['风物集短片'],
    include: [],
    exclude: [],
  },
  '流光拾遗之旅': {
    keyword: ['流光拾遗之旅'],
    include: [],
    exclude: [],
  },
  'CM短片': {
    keyword: ['CM'],
    include: [],
    exclude: [],
  },
  '衣装PV': {
    keyword: ['衣装PV'],
    include: [],
    exclude: [],
  },
  '过场动画': {
    keyword: ['过场动画'],
    include: [],
    exclude: [],
  },
  '剧情PV': {
    keyword: ['剧情PV'],
    include: [],
    exclude: [],
  },
  '角色PV': {
    keyword: ['角色PV'],
    include: [116213, 116322],
    exclude: [],
  },
  '角色演示': {
    keyword: ['全新角色展示', '角色演示', '角色预告'],
    include: [],
    exclude: [],
  },
  '拾枝杂谈': {
    keyword: ['拾枝杂谈'],
    include: [],
    exclude: [],
  },
  '角色逸闻': {
    keyword: ['角色逸闻'],
    include: [],
    exclude: [],
  },
  '角色小记': {
    keyword: ['小记'],
    include: [],
    exclude: [],
  },
  '角色技能演示': {
    keyword: ['角色技能演示', '角色技能展示'],
    include: [],
    exclude: [],
  },
  '角色介绍': {
    keyword: ['角色介绍'],
    include: [],
    exclude: [],
  },
  '玩法介绍': {
    keyword: ['小贴士', '玩法介绍', '玩法说明', '玩法小贴士'],
    include: [],
    exclude: [],
  },
  '开发组座谈会': {
    keyword: ['开发组座谈会'],
    include: [],
    exclude: [],
  },
  '开发者共研计划': {
    keyword: ['开发者共研计划'],
    include: [],
    exclude: [],
  },
  '传说任务说明': {
    keyword: ['传说任务说明', '传说任务即将开启'],
    include: [],
    exclude: [],
  },
  '主线任务说明': {
    keyword: [/魔神任务.*即将开启/, /开启.*魔神任务/],
    include: [],
    exclude: [],
  },
  '联动信息': {
    keyword: ['×原神', 'x 原神', '原神×', '原神 x', '联名', '联动'],
    include: [118376],
    exclude: [118466],
  },
  'PV': {
    keyword: ['PV'],
    include: [],
    exclude: [116497, 116506],
  },
} as SourceClassifyRule

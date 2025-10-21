export default {
  '壁纸': {
    keyword: ['壁纸'],
  },
  '网页活动': {
    keyword: ['H5', '网页活动'],
  },
  'OST': {
    keyword: [/OST.*上线/],
  },
  '武器活动祈愿': {
    keyword: ['神铸赋形'],
  },
  '集录祈愿': {
    keyword: ['集录祈愿'],
  },
  '角色活动祈愿': {
    keyword: ['祈愿即将开启', '祈愿现已开启', '活动祈愿', /祈愿.*概率UP/],
  },
  '表情包': {
    keyword: ['表情包'],
  },
  '提瓦特美食札记': {
    keyword: ['提瓦特美食札记'],
    include: [
      'web_cn.116321', // 香菱
      'web_cn.116345', // 刻晴
      'web_cn.116353', // 砂糖
      'web_cn.116362', // 凯亚
      'web_cn.116381',
      'web_cn.117542', // 九条裟罗
      'web_cn.117546', // 胡桃
    ],
  },
  '生日贺图': {
    keyword: ['生日贺图', /生日.*快乐/],
    include: ['web_cn.116277'], // 神里绫华
    filter: { video: false },
  },
  '音乐会': {
    keyword: ['音乐会'],
  },
  '交响音乐现场': {
    keyword: ['交响音乐现场', /挪德卡莱.*现场/],
    meta: { video: true },
  },
  'EP、MV': {
    keyword: ['音乐动态视频', '《原神》EP', '特别EP', 'MV', '主题曲'],
    meta: { video: true },
    filter: { video: true },
  },
  '版本PV': {
    keyword: ['版本PV'],
    meta: { video: true },
    filter: { video: true },
  },
  '版本活动汇总': {
    keyword: ['活动汇总'],
    meta: { video: true },
  },
  '前瞻预告': {
    keyword: [/特别节目.*即将开启/, '前瞻直播预告', '特别节目预告'],
  },
  '前瞻回顾长图': {
    keyword: [/(前瞻|特别节目).*回顾长图/],
  },
  '前瞻直播': {
    keyword: ['特别节目'],
    include: ['web_cn.116318'], // 1.1
    meta: { video: true },
    filter: { video: true },
  },
  '版本更新说明': {
    keyword: [/版本(?!「七圣召唤」).*更新说明/],
    include: [
      'web_cn.118809', // 1.5
      'web_cn.118827', // 2.5
    ],
    exclude: [
      'web_cn.155785', // 5.6 错误标题
      'web_cn.158507', // PS4 停更
    ],
  },
  '版本专题页': {
    keyword: ['内容专题页', '先行展示页', '版本内容页'],
  },
  '版本活动速递': {
    keyword: ['版本活动速递'],
  },
  '幕后花絮': {
    keyword: ['的幕后', '幕后的故事', '合作幕后'],
    meta: { video: true },
    filter: { video: true },
  },
  '周年视频': {
    keyword: ['周年手札', '配音演员祝福'],
    meta: { video: true },
  },
  '漫画': {
    keyword: ['条漫', '四格漫画'],
  },
  '声优小剧场': {
    keyword: ['蒙德茶会', '璃月雅集'],
    meta: { video: true },
  },
  '沙雕广告': {
    keyword: [
      '原来你也玩原神',
      '《云·原神》动画短片',
      '当然是原神了',
      '春节拯救计划',
      '终于可以玩原神了',
      '云端畅游',
      '小剧场',
      '原来又是一年',
    ],
    meta: { video: true },
    filter: { video: true },
  },
  '寻味之旅': {
    keyword: ['寻味之旅'],
    meta: { video: true },
  },
  'PV短片': {
    keyword: ['PV短片'],
    meta: { video: true },
  },
  '动画短片': {
    keyword: [/(?!.*即将发布).*动画短片.*/],
    meta: { video: true },
  },
  '风物集短片': {
    keyword: ['风物集短片'],
    meta: { video: true },
  },
  '流光拾遗之旅': {
    keyword: ['流光拾遗之旅'],
    meta: { video: true },
  },
  'CM短片': {
    keyword: ['CM'],
    meta: { video: true },
  },
  '前瞻短片': {
    keyword: ['前瞻短片'],
    meta: { video: true },
  },
  '参展视频': {
    keyword: ['东京电玩展', /gamescom/i, /TGA.*参选视频/],
    meta: { video: true },
  },
  '衣装PV': {
    keyword: ['衣装PV'],
    meta: { video: true },
  },
  '过场动画': {
    keyword: ['过场动画'],
    meta: { video: true },
  },
  '剧情PV': {
    keyword: ['剧情PV'],
    meta: { video: true },
  },
  '角色PV': {
    keyword: ['角色PV'],
    include: [
      'web_cn.116213', // 菲谢尔
      'web_cn.116322', // 公子
    ],
    meta: { video: true },
  },
  '角色演示': {
    keyword: ['全新角色展示', '角色演示', '角色预告'],
    meta: { video: true },
  },
  '拾枝杂谈': {
    keyword: ['拾枝杂谈'],
    meta: { video: true },
  },
  '角色逸闻': {
    keyword: ['角色逸闻'],
    meta: { video: true },
  },
  '角色复刻小记': {
    keyword: ['小记'],
    include: ['web_cn.160511'], // 芙宁娜
  },
  '角色技能演示': {
    keyword: ['技能演示', '角色技能展示'],
  },
  '角色介绍': {
    keyword: ['角色介绍'],
  },
  '开发组座谈会': {
    keyword: ['开发组座谈会'],
  },
  '开发者共研计划': {
    keyword: ['开发者共研计划'],
  },
  '传说任务说明': {
    keyword: ['传说任务说明', '传说任务即将开启'],
  },
  '主线任务说明': {
    keyword: [/魔神任务.*即将开启/, /开启.*魔神任务/, '新剧情开启'],
  },
  '联动信息': {
    keyword: ['×原神', 'x 原神', '原神×', '原神 x', '联名', '联动'],
    include: ['web_cn.118376'], // 喜茶二期联动
    exclude: ['web_cn.118466'], // 冰风组曲短片
  },
  'PV': {
    keyword: ['PV'],
    meta: { video: true },
    filter: { video: true },
  },
  '未分类视频': {
    keyword: [/.*/],
    meta: { video: true },
    filter: { video: true },
  },
} as SourceClassifyRule

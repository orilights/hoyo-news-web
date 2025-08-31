export default {
  'OP': {
    keyword: ['OP'],
    meta: {
      video: true,
    },
  },
  '版本PV': {
    keyword: [/\d\.\d版本PV/],
    meta: {
      video: true,
    },
  },
  '前瞻直播': {
    keyword: ['前瞻特别节目'],
    meta: {
      video: true,
    },
  },
  '角色立绘': {
    keyword: ['天外卫星通信', '交错星轨导航', /^翁法罗斯英雄纪/],
    include: [
      'bbs_cn.39123152', // 驭空
      'bbs_cn.39122838', // 罗刹
      'bbs_cn.39122541', // 银狼
      'bbs_cn.35274956', // 彦卿
      'bbs_cn.35190886', // 停云
      'bbs_cn.34868728', // 青雀
      'bbs_cn.34779387', // 白露
      'bbs_cn.21973649', // 素裳
      'bbs_cn.21923536', // 罗刹
      'bbs_cn.21868281', // 艾丝妲
      'bbs_cn.21790366', // 卡芙卡
      'bbs_cn.21636795', // 黑塔
      'bbs_cn.21447782', // 阿兰
      'bbs_cn.21341875', // 银狼
      'bbs_cn.11268772', // 克拉拉
      'bbs_cn.11092765', // 虎克
      'bbs_cn.10939338', // 丹恒
      'bbs_cn.10755908', // 三月七
      'bbs_cn.10654860', // 姬子
    ],
  },
  '角色PV': {
    keyword: ['角色PV'],
    meta: {
      video: true,
    },
  },
  '千星纪游PV': {
    keyword: ['千星纪游PV'],
    meta: {
      video: true,
    },
  },
  '走近星穹': {
    keyword: ['走近星穹'],
    meta: {
      video: true,
    },
  },
  '动画短片': {
    keyword: ['动画短片'],
    meta: {
      video: true,
    },
  },
  '其他动画': {
    keyword: ['动画', '星旅一瞬'],
    meta: {
      video: true,
    },
  },
  '夜间车厢': {
    keyword: ['夜间车厢'],
    meta: {
      video: true,
    },
  },
  '浮光映影': {
    keyword: ['浮光映影'],
    meta: {
      video: true,
    },
  },
  '角色前瞻': {
    keyword: ['角色前瞻'],
    meta: {
      video: true,
    },
  },
  '星旅留影': {
    keyword: ['星旅留影'],
  },
  '星穹美学速递': {
    keyword: ['星穹美学速递'],
  },
  'CHRYSOS'{
    include: [
      'bbs_cn.61758505', // 阿格莱雅
      'bbs_cn.62226845', // 缇宝
      'bbs_cn.62774219', // 万敌
      'bbs_cn.63406113', // 遐蝶
      'bbs_cn.64017761', // 那刻夏
      'bbs_cn.64580342', // 风堇
      'bbs_cn.65207863', // 赛飞儿
      'bbs_cn.65821478', // 白厄
      'bbs_cn.67338348', // 海瑟音
      'bbs_cn.68066450', // 刻律德菈
    ],
  },
  'PV': {
    keyword: ['PV'],
    meta: {
      video: true,
    },
  },
  'EP、MV': {
    keyword: ['EP', 'MV'],
    meta: {
      video: true,
    },
  },
  '遥远星球之歌': {
    keyword: ['遥远星球之歌'],
    meta: {
      video: true,
    },
  },
  '星穹研习会': {
    keyword: ['星穹研习会'],
    meta: {
      video: true,
    },
  },
  '更新电台': {
    keyword: ['更新电台'],
  },
  '帕姆展览馆': {
    keyword: ['帕姆展览馆'],
  },
  '版本更新维护预告': {
    keyword: ['版本更新维护预告'],
  },
  '版本更新说明': {
    keyword: ['版本更新说明'],
  },
  '开拓任务说明': {
    keyword: [/开拓任务.*说明/],
  },
  '版本专题展示页': {
    keyword: ['专题展示页'],
  },
  '光锥活动跃迁': {
    keyword: ['光锥活动跃迁', '流光定影'],
  },
  '角色活动跃迁': {
    keyword: ['角色活动跃迁', /限定5星角色.*概率UP/],
  },
  '活动跃迁': {
    keyword: ['版本活动跃迁'],
  },
  '预下载公告': {
    keyword: ['预下载'],
  },
} as SourceClassifyRule

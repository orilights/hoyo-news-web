export default {
  'OP': {
    keyword: ['OP'],
    include: [],
    exclude: [],
  },
  '版本PV': {
    keyword: [/\d\.\d版本PV/],
    include: [],
    exclude: [],
  },
  '前瞻直播': {
    keyword: ['前瞻特别节目'],
    include: [],
    exclude: [],
  },
  '角色PV': {
    keyword: ['角色PV'],
    include: [],
    exclude: [],
  },
  '千星纪游PV': {
    keyword: ['千星纪游PV'],
    include: [],
    exclude: [],
  },
  '走近星穹': {
    keyword: ['走近星穹'],
    include: [],
    exclude: [],
  },
  '动画短片': {
    keyword: ['动画短片'],
    include: [],
    exclude: [],
  },
  '其他动画': {
    keyword: ['动画', '星旅一瞬'],
    include: [123095, 155342],
    exclude: [],
    filter: {
      video: true,
    },
  },
  'PV': {
    keyword: ['PV'],
    include: [],
    exclude: [123201, 126563, 155548],
  },
  'EP、MV': {
    keyword: ['EP', 'MV'],
    include: [],
    exclude: [],
  },
  '遥远星球之歌': {
    keyword: ['遥远星球之歌'],
    include: [],
    exclude: [],
  },
  '星穹研习会': {
    keyword: ['星穹研习会'],
    include: [],
    exclude: [],
  },
  '版本更新维护预告': {
    keyword: ['版本更新维护预告'],
    include: [],
    exclude: [],
  },
  '版本更新说明': {
    keyword: ['版本更新说明'],
    include: [],
    exclude: [],
  },
  '开拓任务说明': {
    keyword: [/开拓任务.*说明/],
    include: [],
    exclude: [],
  },
  '版本专题展示页': {
    keyword: ['专题展示页'],
    include: [],
    exclude: [],
  },
  '光锥活动跃迁': {
    keyword: ['光锥活动跃迁', '流光定影'],
    include: [],
    exclude: [],
  },
  '角色活动跃迁': {
    keyword: ['角色活动跃迁', /限定5星角色.*概率UP/],
    include: [],
    exclude: [],
  },
  '预下载公告': {
    keyword: ['预下载'],
    include: [],
    exclude: [],
  },
} as SourceClassifyRule

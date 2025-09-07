export default {
  'OP': {
    keyword: ['OP'],
    meta: { video: true },
  },
  '版本PV': {
    keyword: [/\d\.\d版本PV/],
    meta: { video: true },
  },
  '前瞻直播': {
    keyword: ['前瞻特别节目'],
    meta: { video: true },
  },
  '角色PV': {
    keyword: ['角色PV'],
    meta: { video: true },
  },
  '千星纪游PV': {
    keyword: ['千星纪游PV'],
    meta: { video: true },
  },
  '走近星穹': {
    keyword: ['走近星穹'],
    meta: { video: true },
  },
  '动画短片': {
    keyword: [/^(?!.*预告).*动画短片/],
    meta: { video: true },
  },
  '其他动画': {
    keyword: ['动画', '星旅一瞬'],
    include: ['web_cn.123095', 'web_cn.155342'],
    meta: { video: true },
    filter: { video: true },
  },
  'PV': {
    keyword: ['PV'],
    meta: { video: true },
    filter: { video: true },
  },
  'EP、MV': {
    keyword: ['EP', 'MV'],
    meta: { video: true },
  },
  '遥远星球之歌': {
    keyword: ['遥远星球之歌'],
    meta: { video: true },
  },
  '星穹研习会': {
    keyword: ['星穹研习会'],
    meta: { video: true },
  },
  '版本更新维护预告': {
    keyword: ['版本更新维护预告'],
  },
  '版本更新说明': {
    keyword: ['版本更新说明', '版本更新概览'],
  },
  '任务说明': {
    keyword: [/任务.*说明/],
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
  '未分类视频': {
    keyword: [/.*/],
    meta: { video: true },
    filter: { video: true },
  },
} as SourceClassifyRule

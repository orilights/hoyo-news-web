export default {
  '角色': {
    角色立绘: {
      keyword: [],
      include: [
        'bbs_cn.1736221', // 刻晴
        'bbs_cn.1731205', // 莫娜
        'bbs_cn.1692232', // 七七
        'bbs_cn.972401', // 菲谢尔
        'bbs_cn.927308', // 行秋
        'bbs_cn.878858', // 香菱
        'bbs_cn.872974', // 诺艾尔
        'bbs_cn.856717', // 班尼特
        'bbs_cn.807446', // 凝光
        'bbs_cn.753878', // 北斗
        'bbs_cn.460902', // 可莉
        'bbs_cn.356871', // 温迪
        'bbs_cn.289109', // 雷泽
        'bbs_cn.194507', // 迪卢克
        'bbs_cn.144721', // 芭芭拉
        'bbs_cn.91710', // 丽莎
        'bbs_cn.80291', // 琴
        'bbs_cn.74744', // 凯亚
        'bbs_cn.71938', // 安柏
      ],
    },

    角色PV: {
      keyword: ['角色PV'],
      include: [
        'bbs_cn.978587', // 菲谢尔
        'bbs_cn.2505720', // 公子
      ],
      meta: { video: true },
    },

    角色演示: {
      keyword: ['全新角色展示', '角色演示', '角色预告'],
      exclude: [
        'bbs_cn.60643852', // 玛薇卡预告
        'bbs_cn.423425', // 凝光北斗预告
      ],
      meta: { video: true },

      excludeTags: ['角色PV'],
    },

    拾枝杂谈: {
      keyword: ['拾枝杂谈'],
      meta: { video: true },
    },

    角色逸闻: {
      keyword: ['角色逸闻'],
      meta: { video: true },
    },

    角色轶事: {
      keyword: ['轶事', /天使的「..」/, '关于法尔伽的事实'],
      include: [
        'bbs_cn.75835214', // 洛恩
        'bbs_cn.74365326', // 莉奈娅
        'bbs_cn.74344005', // 莉奈娅
        'bbs_cn.74244097', // 莉奈娅
        'bbs_cn.73022162', // 兹白
        'bbs_cn.72479679', // 哥伦比娅
        'bbs_cn.71268782', // 温迪
        'bbs_cn.70176197', // 奈芙尔
        'bbs_cn.68548857', // 菈乌玛
        'bbs_cn.66832544', // 伊涅芙
        'bbs_cn.66644565', // 伊涅芙
        'bbs_cn.65622451', // 丝柯克
      ],
    },

    角色复刻小记: {
      keyword: ['小记', '侧记', '概率UP', '近闻'],

      excludeTags: ['武器活动祈愿', '角色活动祈愿'],
    },

    角色技能演示: {
      keyword: ['技能演示', '角色技能展示'],
    },

    角色介绍: {
      keyword: ['角色介绍'],

      excludeTags: ['角色技能演示'],
    },

  },
  '版本': {
    版本PV: {
      keyword: ['版本PV'],
      include: ['bbs_cn.2447175', 'bbs_cn.3098135'], // 1.1、1.2
      meta: { video: true },
      filter: { video: true },
    },

    版本活动汇总: {
      keyword: [/版本.*活动汇总/],
      meta: { video: true },
    },

    前瞻直播: {
      keyword: [/^(?!.*看).*特别节目.*/],
      include: [
        'bbs_cn.2447867', // 1.1
      ],
      exclude: [
        'bbs_cn.60373394', // 5.3兑换码调整
        'bbs_cn.45003316', // 4.2预告调整
        'bbs_cn.27266015', // 3.0兑换码错误
      ],
      meta: { video: true },

      excludeTags: ['前瞻回顾长图', '前瞻预告'],
    },
    前瞻预告: {
      keyword: [/特别节目.*即将开启/, '前瞻直播预告', '直播前瞻预告', '特别节目预告'],
      include: ['bbs_cn.3825517'], // 1.3
    },

    前瞻回顾长图: {
      keyword: [/(前瞻|特别节目).*(回顾|长图)/],
      filter: { video: false },
    },

    版本更新说明: {
      keyword: [/版本(?!「七圣召唤」).*更新说明/],
      exclude: ['bbs_cn.67197153'], // PS4 停更
    },

    版本专题页: {
      keyword: ['内容专题页', '先行展示页', '版本内容页'],
    },

    版本活动速递: {
      keyword: ['版本活动速递'],
    },

    开发组座谈会: {
      keyword: ['开发组座谈会', '更新施工笔记'],
      include: ['bbs_cn.72281297'], // 月之四
    },

  },
  'PV、动画、短片': {
    动画短片: {
      keyword: [/(?!.*(?:即将|将于).*发布).*动画短片.*/],
      meta: { video: true },

      excludeTags: ['沙雕广告'],
    },
    过场动画: {
      keyword: ['过场动画'],
      meta: { video: true },
    },
    剧情PV: {
      keyword: ['剧情PV'],
      meta: { video: true },
    },
    衣装PV: {
      keyword: ['衣装PV'],
      meta: { video: true },
    },
    前瞻短片: {
      keyword: ['前瞻短片'],
      meta: { video: true },
    },
    生态短片: {
      keyword: ['生态短片'],
      meta: { video: true },
    },
    PV短片: {
      keyword: ['PV短片'],
      meta: { video: true },
    },
    风物集短片: {
      keyword: ['风物集短片'],
      meta: { video: true },
    },

    CM短片: {
      keyword: ['CM'],
      meta: { video: true },

      excludeTags: ['音乐会'],
    },

    参展视频: {
      keyword: ['东京电玩展', /gamescom/i, /TGA.*参选视频/],
      meta: { video: true },
    },

    PV: {
      keyword: ['PV'],
      meta: { video: true },
      filter: { video: true },

      excludeTags: ['PV短片', '剧情PV', '版本PV', '联动信息', '衣装PV', '角色PV'],
    },

  },
  '贺图': {
    生日贺图: {
      keyword: ['生日贺图', /^(?!.*(?:参与(活动|讨论)|已开奖)).*生日.*快乐/],
      include: [
        'bbs_cn.4411765', // 北斗
        'bbs_cn.3798074', // 迪奥娜
        'bbs_cn.2142889', // 行秋
        'bbs_cn.1903837', // 神里绫华
        'bbs_cn.1715895', // 雷泽
        'bbs_cn.1706894', // 重云
        'bbs_cn.1670929', // 莫娜
        'bbs_cn.1577604', // 安柏
        'bbs_cn.1512023', // 可莉
        'bbs_cn.1415959', // 芭芭拉
        'bbs_cn.1333297', // 温迪
        'bbs_cn.1279315', // 丽莎
        'bbs_cn.1252722', // 派蒙
        'bbs_cn.1230838', // 菲谢尔
        'bbs_cn.1115805', // 迪卢克
        'bbs_cn.1063645', // 魈
      ],
      filter: { video: false },
    },

    情人节贺图: {
      keyword: [],
      func: (news) => {
        if (!news.title.trim().startsWith('原神｜') && !news.title.trim().includes('原神 |'))
          return false
        const date = new Date(news.startTime)
        return date.getMonth() === 1 && date.getDate() === 14
      },
      include: [
        'bbs_cn.4411767', // 甘雨
        'bbs_cn.4411766', // 刻晴
      ],
      exclude: [
        'bbs_cn.49255842',
      ],
    },

    白情贺图: {
      keyword: [],
      func: (news) => {
        if (!news.title.trim().startsWith('原神｜') && !news.title.trim().includes('原神 |'))
          return false
        const date = new Date(news.startTime)
        return date.getMonth() === 2 && date.getDate() === 14
      },
      include: [
        'bbs_cn.4942848', // 钟离
        'bbs_cn.4942847', // 公子
      ],
    },

    节日贺图: {
      keyword: ['元旦快乐', '中秋快乐', '除夕快乐', '端午佳节'],
      include: [
        'bbs_cn.40569021', // 2023端午
        'bbs_cn.9750973', // 2021中秋
        'bbs_cn.6807440', // 2021端午
        'bbs_cn.4321629', // 2021除夕
        'bbs_cn.1959692', // 2020中秋
      ],
    },

  },

  '音乐': {
    '交响音乐现场': {
      keyword: ['交响音乐现场', /挪德卡莱.*现场/],
      meta: { video: true },
    },
    'EP、MV': {
      keyword: ['音乐动态视频', '《原神》EP', '特别EP', 'MV', '主题曲'],
      include: [
        'bbs_cn.5345126', // 公子
        'bbs_cn.3902021', // 温迪
        'bbs_cn.2551784', // 芭芭拉
      ],
      meta: { video: true },
      filter: { video: true },

      excludeTags: ['交响音乐现场'],
    },
    '音乐会': {
      keyword: ['音乐会'],

      excludeTags: ['网页活动'],
    },
    'OST': {
      keyword: [/OST.*上线/],

      excludeTags: ['网页活动'],
    },
  },
  '活动': {

    角色活动祈愿: {
      keyword: [
        '祈愿即将开启',
        '祈愿现已开启',
        /活动祈愿.*(即将|现已)开启/,
        /祈愿.*概率UP/,
        '闪焰的驻足', // 可莉
      ],

      excludeTags: ['武器活动祈愿'],
    },
    武器活动祈愿: {
      keyword: ['神铸赋形', /(单手剑|双手剑|长柄武器|法器|弓).*概率UP/],
    },
    集录祈愿: {
      keyword: ['集录祈愿', '晨风之诗', '玉岩之忆', '鸣雷贯天原', '露草的行盏'],
    },
    网页活动: {
      keyword: ['H5', '网页活动'],

      excludeTags: ['壁纸'],
    },
    联动信息: {
      keyword: ['×原神', 'x 原神', '原神×', '原神 x', '联名', '联动'],

      excludeTags: ['幕后花絮', '网页活动', '表情包'],
    },
  },
  '其他': {
    表情包: {
      keyword: ['表情包'],
    },
    漫画: {
      keyword: ['条漫', '漫画'],

      excludeTags: ['角色轶事'],
    },
    壁纸: {
      keyword: ['壁纸'],
    },
    流光拾遗之旅: {
      keyword: ['流光拾遗之旅'],
      meta: { video: true },
    },
    寻味之旅: {
      keyword: ['寻味之旅'],
      meta: { video: true },
    },
    幕后花絮: {
      keyword: ['的幕后', '幕后的故事', '合作幕后'],
      meta: { video: true },
    },

    周年视频: {
      keyword: ['周年手札', '配音演员祝福'],
      meta: { video: true },

      excludeTags: ['壁纸'],
    },

    声优小剧场: {
      keyword: ['蒙德茶会', '璃月雅集'],
      meta: { video: true },

      excludeTags: ['前瞻回顾长图', '前瞻直播', '前瞻预告'],
    },

    沙雕广告: {
      keyword: [
        '原来你也玩原神',
        '《云·原神》动画短片',
        '当然是原神了',
        '春节拯救计划',
        '终于可以玩原神了',
        '云端畅游',
        '原来又是一年',
      ],
      meta: { video: true },
    },

    传说任务说明: {
      keyword: ['传说任务说明', '传说任务即将开启'],
    },

    主线任务说明: {
      keyword: [/魔神任务.*即将开启/, /开启.*魔神任务/, '新剧情开启'],
    },

    开发者共研计划: {
      keyword: ['开发者共研计划'],
    },
  },
} satisfies SourceClassifyRuleGroups

import { COVER_WIDTH } from './misc'

export const API_ENDPOINT = {
  dev: 'http://localhost:8000',
  prod_cn: 'https://api.amarea.cn/game_news',
  prod_os: 'https://api.hk4e.com/game_news',
}

export const NEWS_LIST: Record<string, GameInfo> = {
  genshin: {
    displayName: '原神',
    channals: {
      web_cn: {
        displayName: '官网',
        apiBase: API_ENDPOINT.prod_cn,
        newsDetailLink: 'https://ys.mihoyo.com/main/news/detail/{id}',
        coverWidth: 337.5,
      },
      web_os: {
        displayName: '国际服(zh-tw) 官网',
        apiBase: API_ENDPOINT.prod_os,
        newsDetailLink: 'https://genshin.hoyoverse.com/zh-tw/news/detail/{id}',
        coverWidth: 240,
      },
      bbs_cn_1: {
        displayName: '米游社 公告',
        apiBase: API_ENDPOINT.prod_cn,
        newsDetailLink: 'https://www.miyoushe.com/ys/article/{id}',
        coverWidth: COVER_WIDTH.bbs,
      },
      bbs_cn_2: {
        displayName: '米游社 活动',
        apiBase: API_ENDPOINT.prod_cn,
        newsDetailLink: 'https://www.miyoushe.com/ys/article/{id}',
        coverWidth: COVER_WIDTH.bbs,
      },
      bbs_cn_3: {
        displayName: '米游社 资讯',
        apiBase: API_ENDPOINT.prod_cn,
        newsDetailLink: 'https://www.miyoushe.com/ys/article/{id}',
        coverWidth: COVER_WIDTH.bbs,
      },
    },
  },
  starrail: {
    displayName: '崩坏：星穹铁道',
    channals: {
      web_cn: {
        displayName: '官网',
        apiBase: API_ENDPOINT.prod_cn,
        newsDetailLink: 'https://sr.mihoyo.com/news/{id}',
        coverWidth: 403.5,
      },
      web_os: {
        displayName: '国际服 官网',
        apiBase: API_ENDPOINT.prod_os,
        newsDetailLink: 'https://hsr.hoyoverse.com/zh-cn/news/{id}',
        coverWidth: 266.66,
      },
      bbs_cn_1: {
        displayName: '米游社 公告',
        apiBase: API_ENDPOINT.prod_cn,
        newsDetailLink: 'https://www.miyoushe.com/sr/article/{id}',
        coverWidth: COVER_WIDTH.bbs,
      },
      bbs_cn_2: {
        displayName: '米游社 活动',
        apiBase: API_ENDPOINT.prod_cn,
        newsDetailLink: 'https://www.miyoushe.com/sr/article/{id}',
        coverWidth: COVER_WIDTH.bbs,
      },
      bbs_cn_3: {
        displayName: '米游社 资讯',
        apiBase: API_ENDPOINT.prod_cn,
        newsDetailLink: 'https://www.miyoushe.com/sr/article/{id}',
        coverWidth: COVER_WIDTH.bbs,
      },
    },
  },
  honkai3: {
    displayName: '崩坏3',
    channals: {
      web_cn: {
        displayName: '官网',
        apiBase: API_ENDPOINT.prod_cn,
        newsDetailLink: 'https://bh3.mihoyo.com/news/693/{id}',
        coverWidth: COVER_WIDTH.default,
      },
      web_os: {
        displayName: '国际服 官网',
        apiBase: API_ENDPOINT.prod_os,
        newsDetailLink: 'https://honkaiimpact3.hoyoverse.com/global/zh-cn/news/{id}',
        coverWidth: COVER_WIDTH.default,
      },
      bbs_cn_1: {
        displayName: '米游社 公告',
        apiBase: API_ENDPOINT.prod_cn,
        newsDetailLink: 'https://www.miyoushe.com/bh3/article/{id}',
        coverWidth: COVER_WIDTH.bbs,
      },
      bbs_cn_2: {
        displayName: '米游社 活动',
        apiBase: API_ENDPOINT.prod_cn,
        newsDetailLink: 'https://www.miyoushe.com/bh3/article/{id}',
        coverWidth: COVER_WIDTH.bbs,
      },
      bbs_cn_3: {
        displayName: '米游社 资讯',
        apiBase: API_ENDPOINT.prod_cn,
        newsDetailLink: 'https://www.miyoushe.com/bh3/article/{id}',
        coverWidth: COVER_WIDTH.bbs,
      },
    },
  },
  zzz: {
    displayName: '绝区零',
    channals: {
      web_cn: {
        displayName: '官网',
        apiBase: API_ENDPOINT.prod_cn,
        newsDetailLink: 'https://zzz.mihoyo.com/news/{id}',
        coverWidth: 266.54,
      },
      web_os: {
        displayName: '国际服 官网',
        apiBase: API_ENDPOINT.prod_os,
        newsDetailLink: 'https://zenless.hoyoverse.com/zh-cn/news/{id}',
        coverWidth: 266.66,
      },
      bbs_cn_1: {
        displayName: '米游社 公告',
        apiBase: API_ENDPOINT.prod_cn,
        newsDetailLink: 'https://www.miyoushe.com/zzz/article/{id}',
        coverWidth: COVER_WIDTH.bbs,
      },
      bbs_cn_2: {
        displayName: '米游社 活动',
        apiBase: API_ENDPOINT.prod_cn,
        newsDetailLink: 'https://www.miyoushe.com/zzz/article/{id}',
        coverWidth: COVER_WIDTH.bbs,
      },
      bbs_cn_3: {
        displayName: '米游社 资讯',
        apiBase: API_ENDPOINT.prod_cn,
        newsDetailLink: 'https://www.miyoushe.com/zzz/article/{id}',
        coverWidth: COVER_WIDTH.bbs,
      },
    },
  },
  wd: {
    displayName: '未定事件簿',
    channals: {
      web_cn: {
        displayName: '官网',
        apiBase: API_ENDPOINT.prod_cn,
        newsDetailLink: 'https://wd.mihoyo.com/information/detail/{id}',
        coverWidth: COVER_WIDTH.none,
      },
      bbs_cn_1: {
        displayName: '米游社 公告',
        apiBase: API_ENDPOINT.prod_cn,
        newsDetailLink: 'https://www.miyoushe.com/wd/article/{id}',
        coverWidth: COVER_WIDTH.bbs,
      },
      bbs_cn_2: {
        displayName: '米游社 活动',
        apiBase: API_ENDPOINT.prod_cn,
        newsDetailLink: 'https://www.miyoushe.com/wd/article/{id}',
        coverWidth: COVER_WIDTH.bbs,
      },
      bbs_cn_3: {
        displayName: '米游社 资讯',
        apiBase: API_ENDPOINT.prod_cn,
        newsDetailLink: 'https://www.miyoushe.com/wd/article/{id}',
        coverWidth: COVER_WIDTH.bbs,
      },
    },
  },
  honkai2: {
    displayName: '崩坏学园2',
    channals: {
      bbs_cn_1: {
        displayName: '米游社 公告',
        apiBase: API_ENDPOINT.prod_cn,
        newsDetailLink: 'https://www.miyoushe.com/bh2/article/{id}',
        coverWidth: COVER_WIDTH.bbs,
      },
      bbs_cn_2: {
        displayName: '米游社 活动',
        apiBase: API_ENDPOINT.prod_cn,
        newsDetailLink: 'https://www.miyoushe.com/bh2/article/{id}',
        coverWidth: COVER_WIDTH.bbs,
      },
      bbs_cn_3: {
        displayName: '米游社 资讯',
        apiBase: API_ENDPOINT.prod_cn,
        newsDetailLink: 'https://www.miyoushe.com/bh2/article/{id}',
        coverWidth: COVER_WIDTH.bbs,
      },
    },
  },
  mihoyo: {
    displayName: '米哈游',
    channals: {
      web_cn: {
        displayName: '米哈游',
        apiBase: API_ENDPOINT.prod_cn,
        newsDetailLink: 'https://www.mihoyo.com/news/{id}',
        coverWidth: 269.58,
      },
      web_os: {
        displayName: 'Hoyoverse',
        apiBase: API_ENDPOINT.prod_os,
        newsDetailLink: 'https://www.hoyoverse.com/zh-cn/news/{id}',
        coverWidth: 266.66,
      },
    },
  },
}

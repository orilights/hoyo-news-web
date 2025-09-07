import genshinBbsCn from './genshin.bbs_cn'
import genshinWebCn from './genshin.web_cn'
import starrailBbsCn from './starrail.bbs_cn'
import starrailWebCn from './starrail.web_cn'
import zzzBbsCn from './zzz.bbs_cn'
import zzzWebCn from './zzz.web_cn'

export const NEWS_CLASSIFY_RULE: Record<string, Record<string, SourceClassifyRule>> = {
  genshin: {
    _default: genshinWebCn,
    web_cn: genshinWebCn,
    bbs_cn: genshinBbsCn,
  },
  starrail: {
    _default: starrailWebCn,
    web_cn: starrailWebCn,
    bbs_cn: starrailBbsCn,
  },
  zzz: {
    _default: zzzWebCn,
    web_cn: zzzWebCn,
    bbs_cn: zzzBbsCn,
  },
}

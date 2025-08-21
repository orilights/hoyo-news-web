import genshinBbsCn from './genshin.bbs_cn'
import genshinWebCn from './genshin.web_cn'
import starrailBbsCn from './starrail.bbs_cn'
import starrailWebCn from './starrail.web_cn'
import zzz from './zzz'

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
    _default: zzz,
  },
}

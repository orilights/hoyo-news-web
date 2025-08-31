# 米游新闻检索

一个用于检索米哈游旗下游戏官方发布 新闻/视频 的小工具

<details>
<summary>界面截图</summary>
<img src="docs/preview.png" alt="preview" />
</details>

推荐访问地址：[news-eo.amarea.cn](https://news-eo.amarea.cn/) (EdgeOne)  
备用访问地址：[news.hk4e.com](https://news.hk4e.com/) (Vercel)

当前支持新闻源：
- 官网
- 米游社

<details>
<summary>完整支持列表</summary>

官网：`原神` `崩坏：星穹铁道` `崩坏3` `绝区零` `未定事件簿` `米哈游/Hoyoverse`  
米游社：`崩坏：因缘精灵` `绝区零` `崩坏：星穹铁道` `原神` `未定事件簿` `崩坏3` `崩坏学园2` `大别野`  

</details>

## 功能特性

- 支持根据预置分类和标题关键词检索新闻
- 支持多关键词搜索标题，关键词之间需使用空格分隔
- 支持 RSS 订阅（当前仅官网源包含正文）
- 支持将视频批量导出为 aria2 下载任务（仅官网视频）
- 支持显示视频时长、在 PotPlayer 中打开视频、将视频发送至 aria2 下载

## 附加功能

### 发送单个视频至 aria2 / Motrix / 其他基于 aria2 的下载器

1. 下载安装 [aria2](https://github.com/aria2/aria2/releases) / [Motrix](https://motrix.app/)
2. 在 `aria2.conf` 中启用 RPC 功能 / 在 Motrix 进阶设置中生成 RPC 密钥
3. 在本工具的 `设置` - `下载` 中配置 aria2 的 RPC 地址与密钥
4. 在存在视频的新闻下，点击 `···` 中的 `将视频发送至 aria2 下载`，即可将视频发送至 aria2 / Motrix 下载

### 使用 aria2c 批量下载视频

1. 下载 [aria2](https://github.com/aria2/aria2/releases)
2. 选择你要下载的视频源或筛选分类
3. 使用本工具 `设置` - `常规` 中的 `导出本页视频至 aria2 任务` 功能（仅支持官网视频），将视频下载任务导出为文本文件 `videos.txt`，文件名默认使用新闻标题拼接视频文件原有拓展名
4. 使用如下命令将下载任务导入至 aria2

```bash
aria2c -i videos.txt -d ./download --continue --save-session=session.txt
```

这将会将视频下载到当前目录下的 `download` 文件夹中，同时将下载进度保存至 `session.txt` 文件中，如下载中断，重新执行上述命令即可继续下载

# 米哈游官网新闻检索

<details>
<summary>界面截图</summary>
<img src="docs/preview.png" alt="preview" />
</details>

一个用于检索米哈游旗下游戏官网新闻的小工具  
在线访问：[news.hk4e.com](https://news.hk4e.com/)  
在线访问：[news-eo.amarea.cn](https://news-eo.amarea.cn/)

官网新闻源支持：`原神` `崩坏：星穹铁道` `崩坏3` `绝区零` `未定事件簿` `米哈游`  
米游社新闻源支持：`原神` `崩坏：星穹铁道` `崩坏3` `未定事件簿` `崩坏学园2` `绝区零`

- 支持关键词搜索以及根据分类检索米哈游旗下游戏官网新闻
- 支持快速检索存在视频的新闻
- 支持多关键词搜索，关键词之间使用空格分隔
- 支持将视频导出为 aria2 下载任务

分类功能使用关键词匹配标题实现，有时官网新闻的标题本身写的也不是非常规范，分类结果有错漏属于正常现象，对分类规则有任何意见请提 Issue

新闻获取服务器：[hoyo-news-server](https://github.com/orilights/hoyo-news-server)

## 使用 aria2c 下载视频的简易教程

1. 下载安装 aria2c
2. 使用本工具 `设置` 中的 `导出本页视频至 aria2 任务` 功能，将视频下载任务导出为文本文件 `videos.txt`
3. 将下载任务导入 aria2

```bash
aria2c -i videos.txt -d ./download --continue --save-session=session.txt
```

这将会将视频下载到当前目录下的 `download` 文件夹中，同时将下载进度保存至 `session.txt` 文件中，如下载中断，重新执行上述命令即可继续下载

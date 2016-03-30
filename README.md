# Oxygen
轻音乐

> 今天顿生无聊，感觉陷入一个瓶颈，所以打算开一个新的项目——`Oxygen轻音乐`，比较简单的一个收藏自己喜欢的歌的网站，结合自己之前学过的东西进行整理，从中发现不足，进行下一步学习。同时也可以得到一些`Nope.js`的新函数的灵感，不废话，先进行一下需求分析和技术分析。

# demo 查看
> http://www.libinhong.com:90/

# 需求
* 前端
    * 一个简单的播放器样式
    * 暂停/播放
    * 切歌
    * 音量调节
    * 循环播放
    * 歌词显示（动态 or 静态）
    * 歌曲列表的显示
    * 歌曲 & 歌手信息
* 后台
    * 需要有提供更新歌曲信息的页面
    * 新增歌曲
    * 删除歌曲
    * 排序歌曲

# 技术
* 前端
    * Javascript + CSS3 + HTML5
    * Grunt 负责打包
    * require.js 作模块管理
    * Backbone.js 作为 MVC 框架(优点：轻量级，适合SPA，Oxygen 切歌需要相对多的 dom 操作)
    * 暂定支持IE 9+, Chrome, Firefox, Opera, Edge
* 后台
    * Node.js
    * hbs 模板引擎
    * MongoDB 数据库
    * express Web框架
    * 腾讯云作为资源存放和服务器托管（下行1M，如果速度不满足，改用七牛云）

# 样式
* 参照一下 UI 设计图，并作修改
> http://www.ui.cn/detail/9499.html

* 播放器背景使用高斯模糊对相应歌曲图片处理
* 使用 Font Awesome 字体图标

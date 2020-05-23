# Contributing

非常感谢贡献 Davinci！在参与贡献之前，请仔细阅读以下指引。

## 贡献范畴

### Bug 反馈与修复
我们建议无论是 Bug 反馈还是修复，都先创建一个 Issue 来仔细描述 Bug 的状况，以助于社区可以通过 Issue 记录来找到和回顾问题以及代码。Bug 反馈 Issue 通常需要包含**完整描述 Bug 的信息**以及**可复现的场景**，这样社区才能快速定位导致 Bug 的原因并修复它。包含 `#bug` 标签的打开的 Issue 都是需要被修复的。

### 功能交流、实现、重构
在交流过程中，详细描述新功能（或重构）的细节、机制和使用场景，能够促使它更好更快地被实现。**如果计划实现一个重大的功能（或重构），请务必通过 Issue 或其他方式与核心开发团队进行沟通**，这样大家能以最效率的方式来推进它。包含 `#feature` 标签的打开的 Issue 都是需要被实现的新功能，包含 `#enhancement` 标签的打开的 Issue 都是需要改进重构的功能。

### Issue 答疑
帮助回答 Issue 中的使用问题是为 Davinci 社区做贡献的一个非常有价值的方式；社区中总会有新用户不断进来，在帮助新用户的同时，也可以展现你的专业知识。

### 文档改进
Davinci 用户手册文档在 docs/ 目录下，我们使用了 [jekyll](https://jekyllrb.com/) 作为 Davinci 的文档服务，可以编辑目录里的 Markdown 文件来对文档做改进。

### 国际化
非常抱歉，Davinci 目前仅支持中文语言；但项目前端依赖包含 [react-intl](https://github.com/formatjs/react-intl)，代码结构上也支持国际化，欢迎对其他语言进行贡献。

## 贡献流程

### 分支结构
Davinci 源码可能会产生一些临时分支，但真正有明确意义的只有以下三个分支：

- dev-0.3: 默认分支，主要开发分支；
- master: 最近一次稳定 release 的源码，偶尔会多几次 hotfix 提交；
- dev-0.2: 0.2 版本源码，目前 0.2 版本已经停止更新，如有 0.2 版本使用者或是需要进行二次开发的用户可以参考此分支。

### 开发指引
Davinci 前后端代码共用同一个代码库，但在开发上是分离的。在着手开发之前，请先将 Davinci 项目 fork 一份到自己的 Github Repositories 中， 开发时请基于自己 Github Repositories 中的 Davinci 代码库进行开发。

如果你计划给 Davinci 贡献代码，我们建议克隆 dev-0.3 分支来开发，这样在向 Davinci 主项目提交 PR 时合并冲突的可能性会小很多。
```bash
git clone https://github.com/yourname/davinci.git
```

如果你只是基于稳定功能做一些定制化满足使用需要，我们建议克隆 master 分支来开发。
```bash
git clone https://github.com/yourname/davinci.git --branch master
```


#### 前端
前端源代码在 webapp/ 目录中；davinci-ui/ 目录为编译后的前端文件

##### 目录结构
```
├── app              # 主应用源码
  ├── assets           # 资源文件
  ├── components       # 通用组件
  ├── containers       # 路由容器组件
  ├── utils            # 通用实用方法
  └── app.tsx          # 主应用入口
├── internals        # 开发工程文件
├── libs             # 改动后的项目依赖
├── server           # 开发服务器
├── share            # 分享页源码
└── package.json
```

##### 开发
```
npm install
npm start
```

##### Lint
```
npm run lint
```

##### Test
```
npm run test
```

##### 打包
```
npm run build
```

#### 后端
用户配置在项目根目录 /config/ 下，项目启动脚本和升级补丁脚本在项目根目录 /bin/ 下， 后端代码及核心配置在 server/ 目录下, 日志在项目根目录 /log/ 下。注意：此处所指项目根目录都指环境变量 DAVINCI3_HOME 所配置的目录，在使用 IDE 开发过程中也需要配置环境变量，如 Idea 关于环境变量加载的优先级：`Run/Debug Configurations` 中配置的 `Environment variables` —>  IDE缓存的系统环境变量。

##### 目录结构

脚本
```
├── bin                   # 脚本目录
  ├── migration             # 较大版本变动迁移脚本目录
  ├── patch                 # 数据库补丁
  	 ├── 001_beta5.sql        # 已发布补丁（命名规则：“序列_版本”）
  	 └── beta.sql             # 当期未发布补丁（固定名称）
  ├── build.sh
  ├── davinci.sql           # 完整系统数据库脚本（包含所有补丁）
  ├── initdb.bat            # 针对 Windows 环境的初始化数据库批处理脚本
  ├── initdb.sh             # 针对 Linux、Mac 环境的初始化数据库 Shell 脚本
  ├── phantom.js            # 截图脚本（未来版本将不再使用）
  ├── restart-server.sh     # 针对 Linux、Mac 环境的重启服务脚本
  ├── run.bat               # 针对	Windows 环境的服务启停核心脚本						
  ├── start.bat             # 针对 Windows 环境的服务启动脚本
  ├── start-server.sh       # 针对 Linux、Mac 环境的服务启动脚本
  ├── stop.bat              # 针对 Windows 环境的服务停止脚本
  └── stop-server.sh        # 针对 Linux、Mac 环境的服务停止脚本
```

用户配置
```
├── config                          # 用户配置目录
  ├── application.yml.example         # 应用配置模板
  ├── datasource_driver.yml.example   # 自定义数据源配置模板
  └── logback.xml                     # 日志配置
``` 

代码目录结构
```
├── server                                  # Server 代码根目录
   ├── src                                    # 源码
  	  ├── main
  	  	 ├── java
  	  	 	└── edp
  	  	 	   ├── core                             # 核心配置及通用代码
  	  	 	   ├── davinci                          # Davinci 业务代码 
  	  	 	   ├── DavinciServerApplication         # 系统启动类
  	  	 	   └── SwaggerConfiguration             # Swagger 配置类
  	  	 └── resources
  	  	 	├── generator
  	  	 	├── mybatis                           # mybatis mapping 目录
  	  	 	├── templates                         # 邮件、Sql 模板目录 
  	  	 	├── application.yml                   # 系统核心配置文件
  	  	 	└── banner.txt
  	  └── test                                # 测试代码目录
   └── pom.xml                              # Davinci Server maven 配置文件，继承自项目根目录pom.xml
```

日志目录
```
├── logs        # 日志根目录
  ├── sys         # 系统日志目录
  └── user        # 用户日志目录
  	 ├── opt        # 用户操作日志
  	 └── sql        # 用户Sql日志
``` 

##### 环境变量
配置系统环境变量或 IDE 环境变量 DAVINCI3_HOME，推荐优先使用 IDE 环境变量。

##### 数据库
1. 自行创建 Davinci 系统数据库；
2. 修改 bin/initdb.sh 或 bin/initdb.bat 中的数据库相应信息并执行 或 直接在数据库客户端导入 bin/davinci.sql。

##### 配置文件
重命名 config/ 目录下 `application.yml.example` 文件为 `application.yml`，并配置相关属性。

##### 打包
1. 打完整 release 包需要修改根目录下 /assembly/src/main/assembly/assembly.xml 中相关版本信息，然后在根目录下执行: `mvn clean package` 即可；
2. 打 server 包可直接在 server/ 目录下执行 `mvn clean package`。

### Pull Request 指引
- 如果你还不知道怎样向开源项目发起 PR，请参考[这篇说明](https://help.github.com/en/articles/about-pull-requests)
- 无论是 Bug 修复，还是新功能开发，请将 PR 提交到 dev-0.3 分支。
- PR 和提交名称遵循 `<type>(<scope>): <subject>` 原则，详情可以参考阮一峰的 [Commit message 和 Change log 编写指南](http://www.ruanyifeng.com/blog/2016/01/commit_message_change_log.html) 这篇文章。
- 如果 PR 中包含新功能，理应将文档更新包含在本次 PR 中。
- 如果本次 PR 尚未准备好合并，请在名称头部加上 [WIP] 前缀（WIP = work-in-progress）。
- 所有提交到 dev-0.3 分支的提交至少需要经过一次 Review 才可以被合并

### Review 标准

在贡献代码之前，可以了解一下什么样的提交在 Review 中是受欢迎的。简单来说，如果一项提交能带来尽可能多增益和尽可能少的副作用或风险，那它被合并的几率就越高，Review 的速度也会越快。风险大、价值低的提交是几乎不可能被合并的，并且有可能会被拒绝连 Review 的机会都没有。

#### 增益
- 修复导致 Bug 的主要原因
- 添加或修复一个大量用户亟需的功能或问题
- 简单有效
- 容易测试，有测试用例
- 减少复杂度以及代码量
- 经社区讨论过的、确定需要改进的问题
#### 副作用和风险
- 仅仅修复 Bug 的表面现象
- 引入复杂度高的新功能
- 为满足小众需求添加复杂度
- 改动稳定的现有API或语义
- 导致其他功能不能正常运行
- 添加大量依赖
- 随意改变依赖版本
- 一次性提交大量代码或改动
#### Reviewer 注意事项
- 请使用建设性语气撰写评论
- 如果需要提交者进行修改，请明确说明完成此次 Pull Request 所需要修改的所有内容
- 如果某次 PR 在合并后发现带来了新问题，Reviewer 需要向 PR 作者联系并沟通解决问题；如果无法联系到 PR 作者，Reviewer 需要将此次 PR 进行还原

## 贡献进阶

### 关于 Committers（Collaborators）

#### 如何成为 Committer
如果你对 Davinci 代码有过颇具价值的 PR 并且被合并，你可以在这个 [Issue](https://github.com/edp963/davinci/issues/1194) 下评论，或是通过官方微信群联系核心开发团队申请成为 Davinci 项目的 Committer；核心开发团队和其他 Committers 将会一起投票决定是否允许你的加入，如果得到足够票数，你将成为 Davinci 项目的 Committer。

#### Committer 的权利
- 可以加入官方开发者微信群，参与讨论和制定开发计划
- 可以对 Issue 进行管理，包括关闭、添加标签
- 可以创建和管理项目分支，master、dev-0.3、dev-0.2 分支除外
- 可以对提交到 dev-0.3 分支的 PR 进行 Review
- 可以申请成为 Committee 成员

### 关于 Committee

#### 如何成为 Committee 成员
如果你是 Davinci 项目的 Committer，并且你贡献的所有内容得到了其他 Committee 成员的认可，你可以申请成为 Davinci Committee 成员，其他 Committee 成员将会一起投票决定是否允许你的加入，如果全票通过，你将成为 Davinci Committee 成员。

#### Committee 成员的权利
- 可以合并其他 Committers 和贡献者提交到 dev-0.3 分支的 PR
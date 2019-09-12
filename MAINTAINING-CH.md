# Maintaining

## 项目管理

Davinci 项目通过 [Project](https://github.com/edp963/davinci/projects) 来管理开发计划和维护清单。

### 开发计划

开发计划在 [Roadmap](https://github.com/edp963/davinci/projects/4) 中管理。Committers 可以在 `To do` 栏中自行添加功能卡片，当功能还在卡片阶段时，意味着此功能还在设计和讨论阶段，卡片中应当包含：
- 功能描述标题
- 功能设计明细及原理
- 如果包含子功能项，请逐一列出

当功能经过设计和讨论阶段之后，可以将功能卡片转成 Issue，并打上相应的 Tags。如果有 Committers 计划开发实现它，请将 Issue 拖到 `In progress` 栏中，并添加自己到 Issue 的 Assignees 列表中。**请确保功能经过充分设计和讨论之后再开始开发，未经社区讨论过的功能 PR 不会被合并。**

### 维护清单

维护清单在 [Maintenance](https://github.com/edp963/davinci/projects/5) 中管理。Committers 可以在 To do 栏中自行添加 bug 或亟待修复的缺陷类 Issue。同样的，如果有 Committers 计划开发修复它，请将 Issue 拖到 `In progress` 栏中，并添加自己到 Issue 的 Assignees 列表中。

**为保证开发高效以及目标专注，建议每位 Committer 在所有 Project `In progress` 栏中的 Issue 不超过2个。**

## 版本发布周期及流程

当前阶段，如无特殊需求，每月发布一个 `minor` 版本，正式版本发布不遵循此规则

版本发布之前需要确认
- 所有功能可以正常运行
- 与此版本相关的 Issue 和 PR 已经被正确处理

编辑更新日志以及升级版本号
- 新建一个 PR 将 dev-0.3 分支合并到 master，所有发布操作需要在 master 分支上进行。**注意！不要使用 squash merge！防止提交信息丢失！**
- 从 master 新建一个 release 分支用来做发布的修改（例如：git checkout -b release-beta.7）
- 在 CHANGELOG.md 里添加发布日志，可以用 compare 功能找到当前和之前版本的区别，将有价值的改动如实反馈给用户
- 对用户使用上无感知的改动建议（文档修补、微小的样式优化、代码风格重构等等）不要提及，保持 changelog 的内容有效性
- 用面向开发者的角度和叙述方式撰写 changelog，不描述修复细节，描述问题和对开发者的影响
- 尽量给出原始的 PR 链接，社区提交的 PR 改动加上提交者的链接或 Issue 链接
- 如果不确定改动的真实目的，可以向提交者进行咨询
- push release 分支并发起 changelog 的 PR 请其他 Committee 成员进行 Review
- PR 的内容里填上 changelog 内容，好处是版本 changelog 的 PR 会关联在各个 issue 中，很容易知道 Issue 在哪个版本被改了

正式发布 release
- 更新日志的修改合并后，删除 release-x 分支，给当前 master 分支打上版本号 tag
- 上传 release 包，发布 release note
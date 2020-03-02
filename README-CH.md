Davinci
============

[![License](https://img.shields.io/badge/license-Apache%202-4EB1BA.svg)](https://www.apache.org/licenses/LICENSE-2.0.html)
[![Total Lines](https://tokei.rs/b1/github/edp963/davinci?category=lines)](https://github.com/edp963/davinci)
[![Build Status](https://travis-ci.org/edp963/davinci.svg?branch=master)](https://travis-ci.org/edp963/davinci)
[![GitHub release](https://img.shields.io/github/release/edp963/davinci.svg)](https://github.com/edp963/davinci/releases)
[![Stargazers over time](https://starcharts.herokuapp.com/edp963/davinci.svg)](https://starcharts.herokuapp.com/edp963/davinci)

**Davinci是一个DVAAS（Data Visualization as a Service）平台解决方案。**

Davinci面向业务人员/数据工程师/数据分析师/数据科学家，致力于提供一站式数据可视化解决方案。既可作为公有云/私有云独立使用，也可作为可视化插件集成到三方系统。用户只需在可视化UI上简单配置即可满足多种数据可视化需求，并支持高级交互/行业分析/模式探索/社交智能等可视化功能。

## 设计理念

* **围绕 View（数据视图）和 Widget（可视组件）两个核心概念设计**
  * View是数据的结构化形态，一切逻辑/权限/服务等相关都是从View展开。
  * Widget是数据的可视化形态，一切展示/交互/引导等都是从Widget展开。
  * 作为数据的两种不同形态，二者相辅相成，让用户拥有一致的体验和认识。
* **强化集成定制能力和社交智能能力**
  * 集成定制能力指无缝集成到三方系统，并提供强大的定制化能力，使其和三方系统融为一体。
  * 社交智能能力指共享优秀的数据可视化思想，激发用户对数据可视化表达能力和艺术美感的追求，同时也使Davinci更加智能的引导和提高用户的数据可视化能力。
  * 在数据可视化领域里，Davinci重视基础的交互能力和多种多样的图表选择能力，同时更加重视集成定制能力和社交智能能力。

## 功能特点

- **数据源**
  - 支持多种 JDBC 数据源
  - 支持 CSV 数据文件上传

- **数据模型**
  - 支持友好 SQL 编辑器进行数据处理和转换
  - 支持自动和自定义数据模型设计和共享

- **可视化组件**
  - 支持基于数据模型拖拽智能生成可视化组件
  - 支持各种可视化组件样式配置
  - 支持自由分析能力

- **数据门户**
  - 支持基于可视化组件创建可视化仪表板
  - 支持可视化组件自动布局
  - 支持可视化组件全屏显示、本地控制器、高级过滤器、组件间联动、群控控制器可视组件
  - 支持可视化组件大数据量展示分页和滑块
  - 支持可视化组件 CSV 数据下载、公共分享授权分享以及可视化仪表板的公共分享和授权分享
  - 支持基于可视化仪表板创建数据门户

- **数据大屏**
  - 支持可视化组件自由布局
  - 支持图层、透明度设置、边框、背景色、对齐、标签等更丰富大屏美化功能
  - 支持多种屏幕自适应方式

- **用户体系**
  - 支持多租户用户体系
  - 支持每个用户自建一整套组织架构层级结构
  - 支持浅社交能力

- **安全权限**
  - 支持 LDAP 登录认证
  - 支持动态 Token 鉴权
  - 支持细粒度操作权限矩阵配置
  - 支持数据列权限、行权限

- **集成能力**
  - 支持安全 URL 嵌入式集成
  - 支持 JS 融入式集成

- **多屏适应**
  - 支持大屏、PC、Pad、手机移动端等多屏自适应

Documentation
=============
Please refer to [Davinci用户手册](https://edp963.github.io/davinci/).

Latest Release
=============
Please download the latest [RELEASE](https://github.com/edp963/davinci/releases/download/v0.3.0-beta.9/davinci-assembly_3.0.1-0.3.1-SNAPSHOT-dist-beta.9.zip).

Get Help
============
The fastest way to get response from our developers is to send email to our mail list edp_support@groups.163.com,
and you are also welcome to join our WeChat group for online discussion.

![二维码](https://github.com/edp963/edp-resource/raw/master/WeChat.jpg)

License
============
Please refer to [LICENSE](https://github.com/edp963/davinci/blob/master/LICENSE) file.

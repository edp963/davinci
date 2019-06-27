Davinci
============

[![License](https://img.shields.io/badge/license-Apache%202-4EB1BA.svg)](https://www.apache.org/licenses/LICENSE-2.0.html)
[![Total Lines](https://tokei.rs/b1/github/edp963/davinci?category=lines)](https://github.com/edp963/davinci)
[![Build Status](https://travis-ci.org/edp963/davinci.svg?branch=master)](https://travis-ci.org/edp963/davinci)
[![GitHub release](https://img.shields.io/github/release/edp963/davinci.svg)](https://github.com/edp963/davinci/releases)
[![Stargazers over time](https://starcharts.herokuapp.com/edp963/davinci.svg)](https://starcharts.herokuapp.com/edp963/davinci)

> 来自[宜信](https://www.creditease.cn/)[技术研发中心](http://crdc.creditease.cn/)的可视应用平台

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

* **数据源**
  * 支持JDBC数据源
  * 支持CSV文件上传
* **数据视图**
  * 支持定义SQL模版
  * 支持SQL高亮显示
  * 支持SQL测试
  * 支持回写操作
* **可视组件**
  * 支持预定义图表
  * 支持控制器组件
  * 支持自由样式
* **交互能力**
  * 支持可视组件全屏显示
  * 支持可视组件本地控制器
  * 支持可视组件间过滤联动
  * 支持群控控制器可视组件
  * 支持可视组件本地高级过滤器
  * 支持大数据量展示分页和滑块
* **集成能力**
  * 支持可视组件CSV下载
  * 支持可视组件公共分享
  * 支持可视组件授权分享
  * 支持仪表板公共分享
  * 支持仪表板授权分享
* **安全权限**
  * 支持数据行列权限
  * 支持LDAP登录集成

## Quickstart  

#### Setup

* **上传davinci zip包到系统某个目录下，如. /app/davinci，将其解压。解压之后的目录结构如下图所示：**

  <img src="https://github.com/edp963/davinci/raw/master/docs/img/dir.png" alt="" width="600"/>

  * 0.3版本使用 yaml 作为应用配置文件格式，主要配置项包括：server、datasource（请确保连接地址的正确性，初始化数据库时也会用到！！！）、mail（邮箱服务器必须配置）。

     注： 1. 如需接入reids，可继续加入redis的相关配置。 
          2. 由于 yaml 语法的特殊性，请务必确保每个配置项冒号和值之间至少有一个空格。


```
   unzip davinci-assembly_3.0.1-0.3.0-SNAPSHOT-dist-beta.3.zip

   cd config

   mv application.yml.example application.yml

   vim application.yml
```

  ```
    server:
      protocol: http
      address: 127.0.0.1
      port: 8080


    ## jwt is one of the important configuration of the application
    ## jwt config cannot be null or empty
    jwtToken:
      secret: secret
      timeout: 1800000
      algorithm: HS512


    ##your datasouce config
    source:
      initial-size: 2
      min-idle: 1
      max-wait: 6000
      max-active: 10


    spring:
      mvc:
        async:
          request-timeout: 30s

      ## davinci datasouce config
      datasource:
        url: jdbc:mysql://localhost:3306/davinci0.3?useUnicode=true&characterEncoding=UTF-8&zeroDateTimeBehavior=convertToNull&allowMultiQueries=true
        username:
        password:
        driver-class-name: com.mysql.jdbc.Driver
        initial-size: 2
        min-idle: 1
        max-wait: 60000
        max-active: 10

      ## redis config
      ## please choose either of the two ways
      redis:
        isEnable: false

      ## standalone config
        host: 127.0.0.1
        port: 6379

      ## cluster config
      #  cluster:
      #       nodes:

        password:
        database: 0
        timeout: 1000
        jedis:
          pool:
            max-active: 8
            max-wait: 1
            max-idle: 8
            min-idle: 0

      ## mail is one of the important configurations of the application
      ## mail config cannot be null or empty
      ## some mailboxes need to be set password for the SMTP service separately)
      mail:
        host:
        port:
        username:
        password:
        nickname:

        properties:
          smtp:
            starttls:
              enable: false
              required: true
            auth: true
          mail:
            smtp:
              ssl:
                enable: false

    phantomjs_home: "$your_phantomjs_path$/phantomjs"
  ```

* **配置log的存放位置（可配置为绝对路径）**

   `vi config/logback.xml`
* **配置DAVINCI3_HOME**

```
    vi /etc/profile 
    
    export DAVINCI3_HOME=/app/davinci
    
    source /etc/profile
```

* **初始化数据库, 修改port、ip、user 及 password，与application.yml里datasource的配置一致即可（只在首次启动前需要进行初始化）**

```
    cd /app/davinci/bin

    vi initdb.sh

    sh initdb.sh
```

  * **配置并且初始化完成后即可启动davinci server**

 ```
    sh bin/start-server.sh
 ```
  * **通过日志监控启动、运行状态**
  
  注： 默认的日志文件是以日期命名的，如不符合日期要求，可自行修改`config/logback.xml`中的日志模板
  
  ```
    tail -200f logs/davinci.XXXX.log
  ```

* **输入http://localhost:8080，进入davinci登录界面(super@davinci.com/123456)**

#### 创建source，指定用户名、密码和jdbc url即可
<img src="https://github.com/edp963/davinci/raw/master/docs/img/source.png" alt="" width="600"/>

#### 创建view，选择对应的source，编写sql（可定义变量）
<img src="https://github.com/edp963/davinci/raw/master/docs/img/view.png" alt="" width="600"/>

#### 创建widget，选择对应的view，指定图表类型，配置样式
<img src="https://github.com/edp963/davinci/raw/master/docs/img/widget.png" alt="" width="600"/>

#### 创建dashboard，加入widget，dashboard内widget可被自由拖拽也可全屏显示
<img src="https://github.com/edp963/davinci/raw/master/docs/img/dashboard.png" alt="" width="600"/>

#### 以上是简短的功能和用户体验预览，更多强大的细节功能请参见其他部分  

Documentation
=============
Please refer to [Davinci用户手册](https://edp963.github.io/davinci/).

Latest Release
=============
Please download the latest [RELEASE](https://github.com/edp963/davinci/releases/download/v0.3.0-beta.5/davinci-assembly_3.0.1-0.3.1-SNAPSHOT-dist-beta.5.zip).

Get Help
============
The fastest way to get response from our developers is to send email to our mail list edp_support@groups.163.com,
and you are also welcome to join our WeChat group for online discussion.

![二维码](https://github.com/edp963/edp-resource/raw/master/WeChat.jpg)

License
============
Please refer to [LICENSE](https://github.com/edp963/davinci/blob/master/LICENSE) file.

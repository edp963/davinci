### 注意！

1. **升级前请务必备份数据！！！, 升级前请务必备份数据！！！, 升级前请务必备份数据！！！**
2. 本次升级只针对 davinci0.3 beta.4 升级至 beta.5， 其他版本请不要执行！
3. 已安装 beta.5 及之后版本无须执行此脚本；
4. 本次升级默认读取 config 下 application.yml 中配置的 davinci 数据源，也可通过参数指定，更多信息请执行 ‘upgrade -help’ 查看；
5. 本次升级可能造成部分 View 中定义的`变量值`错误，请手动修改；
6. 升级脚本为二进制文件，不同平台执行相应脚本即可，无须重复执行：

   | 平台 | 对应脚本 |
   | --- | --- |
   |Windows | upgrade.exe |
   |Mac OS  |  upgrade_darwin |
   |Linux   |  upgrade_linux |
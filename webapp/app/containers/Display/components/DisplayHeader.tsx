import * as React from 'react'

const Icon = require('antd/lib/icon')
const Tooltip = require('antd/lib/tooltip')

const styles = require('../Display.less')

interface IDisplayHeaderProps {
  widgets: any[]
}

export function DisplayHeader (props: IDisplayHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.commands}>
        <ul className={styles.historyBack}>
          <li>
            <Tooltip placement="bottom" title="返回">
              <Icon type="left-circle-o" />
            </Tooltip>
          </li>
        </ul>
        <ul className={styles.commandGroup}>
          <li>
            <Tooltip placement="bottom" title="Widgets">
              <i className={`iconfont icon-chart-bar ${styles.primary}`} />
            </Tooltip>
          </li>
          <li>
            <Tooltip placement="bottom" title="辅助图形">
              <Icon type="appstore" className={styles.primary} />
            </Tooltip>
          </li>
        </ul>
        <ul className={styles.commandGroup}>
          <li>
            <Tooltip placement="bottom" title="复制">
              <i className="iconfont icon-fuzhi" />
            </Tooltip>
          </li>
          <li>
            <Tooltip placement="bottom" title="粘贴">
              <i className="iconfont icon-niantie" />
            </Tooltip>
          </li>
          <li>
            <Tooltip placement="bottom" title="撤销">
              <i className="iconfont icon-chexiao" />
            </Tooltip>
          </li>
          <li>
            <Tooltip placement="bottom" title="前进">
              <i className="iconfont icon-qianjin" />
            </Tooltip>
          </li>
          <li>
            <Tooltip placement="bottom" title="删除">
              <Icon type="delete" />
            </Tooltip>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default DisplayHeader

import React from 'react'
import PropTypes from 'prop-types'

import Icon from 'antd/lib/icon'
import Tooltip from 'antd/lib/tooltip'

import styles from '../Display.less'

export function DisplayHeader (props) {
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

DisplayHeader.propTypes = {
  widgets: PropTypes.array
}

export default DisplayHeader

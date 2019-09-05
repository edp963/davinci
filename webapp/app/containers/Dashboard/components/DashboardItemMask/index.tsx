import React from 'react'
import ChartTypes from 'containers/Widget/config/chart/ChartTypes'
import { Icon } from 'antd'
import styles from './style.less'

export interface IDashboardItemMaskProps {
  loading: boolean
  chartType: ChartTypes
  empty: boolean
  hasDataConfig: boolean
  children?: React.ReactElement<any>
}

function Mask (props: IDashboardItemMaskProps) {
  const { chartType, hasDataConfig, children } = props
  switch (chartType) {
    case ChartTypes.Iframe:
      return null
    case ChartTypes.RichText:
      return hasDataConfig && children
    default:
      return children
  }
}

function Loading (props: IDashboardItemMaskProps) {
  const { loading } = props
  if (!loading) { return null }
  return (
    <Mask {...props}>
      <div className={styles.mask}>
        <Icon type="loading" />
        <p>加载中…</p>
      </div>
    </Mask>
  )
}

function Empty (props: IDashboardItemMaskProps) {
  const { loading, empty } = props
  if (loading || !empty) { return null }
  return (
    <Mask {...props}>
      <div className={styles.mask}>
        <Icon type="inbox" className={styles.emptyIcon} />
        <p>暂无数据</p>
      </div>
    </Mask>
  )
}

const DashboardItemMask = { Loading, Empty }

export default DashboardItemMask

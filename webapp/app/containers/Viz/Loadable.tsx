import React from 'react'
import loadable from 'utils/loadable'
import { Skeleton } from 'antd'

export const Viz = loadable(() => import('./'), {
  fallback: <Skeleton active={true} paragraph={{ rows: 15 }} />
})

export const VizList = loadable(() => import('./VizList'), {
  fallback: <Skeleton active={true} paragraph={{ rows: 15 }} />
})

export const PortalIndex = loadable(() => import('./Portal'), {
  fallback: <Skeleton active={true} paragraph={{ rows: 15 }} />
})

export const VizDisplay = loadable(() => import('./Display'), {
  fallback: <Skeleton active={true} paragraph={{ rows: 15 }} />
})

export default Viz

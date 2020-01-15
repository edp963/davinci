import React from 'react'
import loadable from 'utils/loadable'
import { Skeleton } from 'antd'

export const Sidebar = loadable(() => import('./Sidebar'), {
  fallback: <Skeleton active={true} paragraph={{ rows: 15 }} />
})

export const Main = loadable(() => import('./'), {
  fallback: <Skeleton active={true} paragraph={{ rows: 15 }} />
})

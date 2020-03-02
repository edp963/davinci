import React from 'react'
import loadable from 'utils/loadable'
import { Skeleton } from 'antd'

export const Widget = loadable(() => import('./'), {
  fallback: <Skeleton active={true} paragraph={{ rows: 15 }} />
})

export const WidgetList = loadable(() => import('./List'), {
  fallback: <Skeleton active={true} paragraph={{ rows: 15 }} />
})

export const Workbench = loadable(() => import('./components/Workbench'), {
  fallback: <Skeleton active={true} paragraph={{ rows: 15 }} />
})

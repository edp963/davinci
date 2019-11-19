import React from 'react'
import loadable from 'utils/loadable'
import { Skeleton } from 'antd'

export const View = loadable(() => import('./'), {
  fallback: <Skeleton active={true} paragraph={{ rows: 15 }} />
})

export const ViewEditor = loadable(() => import('./Editor'), {
  fallback: <Skeleton active={true} paragraph={{ rows: 15 }} />
})

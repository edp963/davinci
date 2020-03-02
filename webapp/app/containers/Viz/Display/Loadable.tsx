import React from 'react'
import loadable from 'utils/loadable'
import { Skeleton } from 'antd'

export const VizDisplayEditor = loadable(() => import('./Editor'), {
  fallback: <Skeleton active={true} paragraph={{ rows: 15 }} />
})

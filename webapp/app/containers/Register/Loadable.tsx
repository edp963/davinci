import React from 'react'
import loadable from 'utils/loadable'
import { Skeleton } from 'antd'

export const Activate = loadable(() => import('./Activate'), {
  fallback: <Skeleton active={true} paragraph={{ rows: 15 }} />
})

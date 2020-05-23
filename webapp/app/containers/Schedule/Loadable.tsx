import React from 'react'
import loadable from 'utils/loadable'
import { Skeleton } from 'antd'

export const Schedule = loadable(() => import('./'), {
  fallback: <Skeleton active={true} paragraph={{ rows: 15 }} />
})

export const ScheduleEditor = loadable(() => import('./Editor'), {
  fallback: <Skeleton active={true} paragraph={{ rows: 15 }} />
})

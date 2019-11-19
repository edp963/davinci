import React from 'react'
import loadable from 'utils/loadable'
import { Skeleton } from 'antd'

export const OrganizationList = loadable(() => import('./'), {
  fallback: <Skeleton active={true} paragraph={{ rows: 15 }} />
})

export const Organization = loadable(() => import('./Organization'), {
  fallback: <Skeleton active={true} paragraph={{ rows: 15 }} />
})

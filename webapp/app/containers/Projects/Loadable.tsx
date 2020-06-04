import React from 'react'
import loadable from 'utils/loadable'
import { Skeleton } from 'antd'

export const Project = loadable(() => import('./'), {
  fallback: <Skeleton active={true} paragraph={{ rows: 15 }} />
})

export const ProjectList = loadable(() => import('./List'), {
  fallback: <Skeleton active={true} paragraph={{ rows: 15 }} />
})

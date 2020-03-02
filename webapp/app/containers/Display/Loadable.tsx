import React from 'react'
import loadable from 'utils/loadable'
import { Skeleton } from 'antd'

export const Display = loadable(() => import('./'), {
  fallback: <Skeleton active={true} paragraph={{ rows: 15 }} />
})

export const DisplayEditor = loadable(() => import('./Editor'), {
  fallback: <Skeleton active={true} paragraph={{ rows: 15 }} />
})

export const DisplayPreview = loadable(() => import('./Preview'), {
  fallback: <Skeleton active={true} paragraph={{ rows: 15 }} />
})

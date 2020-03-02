import React from 'react'
import loadable from 'utils/loadable'
import { Skeleton } from 'antd'

export const Profile = loadable(() => import('./'), {
  fallback: <Skeleton active={true} paragraph={{ rows: 15 }} />
})

export const UserProfile = loadable(() => import('./UserProfile'), {
  fallback: <Skeleton active={true} paragraph={{ rows: 15 }} />
})

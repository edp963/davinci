import React from 'react'
import loadable from 'utils/loadable'
import { Skeleton } from 'antd'

const fallback = <Skeleton paragraph={{ rows: 4 }} />

export const LineSection = loadable(() => import('./Line'), { fallback })

export const PieSection = loadable(() => import('./Pie'), { fallback })

export const FunnelSection = loadable(() => import('./Funnel'), { fallback })

export const MapSection = loadable(() => import('./Map'), { fallback })

export const ParallelSection = loadable(() => import('./Parallel'), { fallback })

export const SankeySection = loadable(() => import('./Sankey'), { fallback })

export const DoubleYAxisSection = loadable(() => import('./DoubleYAxis'), { fallback })


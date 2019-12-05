
import * as Types from './types'
export type StackGroup = Types.StackGroup
export type StackMetrics = Types.IStackMetrics
export type StackConfig = Types.IStackConfig

import loadable from 'utils/loadable'
import { IStackConfigModalProps } from './StackConfigModal'

export const StackConfigModal = loadable<IStackConfigModalProps>(() => import('./StackConfigModal'), {
  fallback: null
})

export { EmptyStack } from './constants'
export { getStackName } from './util'

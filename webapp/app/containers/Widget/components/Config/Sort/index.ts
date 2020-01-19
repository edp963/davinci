import * as Types from './types'
export type IFieldSortConfig = Types.IFieldSortConfig
export type IFieldSortDescriptor = Types.IFieldSortDescriptor
export { FieldSortTypes } from './constants'
export { fieldGroupedSort } from './util'

import loadable from 'utils/loadable'
import { ISortConfigModalProps } from './SortConfigModal'

export const SortConfigModal = loadable<ISortConfigModalProps>(() => import('./SortConfigModal'), {
  fallback: null
})

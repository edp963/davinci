import { IFieldSortDescriptor } from './types'

export function fieldGroupedSort (data: object[], descriptors: IFieldSortDescriptor[]) {
  if (!Array.isArray(descriptors) || !descriptors.length) { return data }

  data.sort((r1, r2) => {
    let result = 0
    descriptors.some(({ name, list }) => {
      const v1 = r1[name]
      const v2 = r2[name]
      const order = list.indexOf(v1) - list.indexOf(v2)
      if (order !== 0) {
        result = order
        return true
      }
    })
    return result
  })
}

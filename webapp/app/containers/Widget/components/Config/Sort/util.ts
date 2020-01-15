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

export function inGroupColorSort (
  groupEntries: Array<[string, unknown]>,
  descriptor: IFieldSortDescriptor
) {
  groupEntries.sort((e1, e2) => {
    let result = 0
    const { list } = descriptor
    const order = list.indexOf(e1[0]) - list.indexOf(e2[0])
    if (order !== 0) {
      result = order
    }
    return result
  })
}

import * as csvParser from 'jquery-csv'
import { uuid } from '../utils/util'
import { KEY_COLUMN } from '../globalConstants'

interface IResultset {
  result: any[]
  offset: number,
  limit: number,
  totalCount: number
}

export default function resultsetConverter (resultset: IResultset) {
  let dataSource = []
  let keys = []
  let types = []

  if (resultset.result && resultset.result.length) {
    const arr = resultset.result

    arr.splice(0, 2).forEach((d, index) => {
      if (index) {
        types = csvParser.toArray(d)
      } else {
        keys = csvParser.toArray(d)
      }
    })

    dataSource = arr.map(csvVal => {
      const jsonVal = csvParser.toArray(csvVal)
      let obj = {
        [KEY_COLUMN]: uuid(8, 32)
      }
      keys.forEach((k, index) => {
        obj[k] = jsonVal[index]
      })
      return obj
    })
  }

  return {
    dataSource: dataSource,
    keys: keys,
    types: types,
    pageSize: resultset.limit,
    pageIndex: Math.floor(resultset.offset / resultset.limit) + 1,
    total: resultset.totalCount
  }
}

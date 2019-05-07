import { IViewModel, ISqlColumn } from './types'

import { SqlTypes } from 'app/globalConstants'
import { ModelTypeSqlTypeSetting, VisualTypeSqlTypeSetting } from './constants'

function getMapKeyByValue (value: SqlTypes, map: typeof VisualTypeSqlTypeSetting | typeof ModelTypeSqlTypeSetting) {
  let result
  Object.entries(map).some(([key, values]) => {
    if (values.includes(value)) {
      result = key
      return true
    }
  })
  return result
}

export function getValidModel (model: IViewModel[], sqlColumns: ISqlColumn[]) {
  if (!Array.isArray(sqlColumns)) { return [] }

  const validModel = sqlColumns.map<IViewModel>((column) => {
    const { name: columnName, type: columnType } = column
    const modelItem = model.find((m) => m.name === columnName)
    if (!modelItem) {
      return {
        name: columnName,
        sqlType: columnType,
        visualType: getMapKeyByValue(columnType, VisualTypeSqlTypeSetting),
        modelType: getMapKeyByValue(columnType, ModelTypeSqlTypeSetting)
      }
    } else {
      const item = { ...modelItem }
      // @TODO verify modelType & visualType are valid by the sqlType or not
      // if (!VisualTypeSqlTypeSetting[item.visualType].includes(columnType)) {
      //   needNotify = true
      //   item.visualType = getMapKeyByValue(columnType, VisualTypeSqlTypeSetting)
      // }
      // if (!ModelTypeSqlTypeSetting[item.modelType].includes(columnType)) {
      //   needNotify = true
      //   item.modelType = getMapKeyByValue(columnType, ModelTypeSqlTypeSetting)
      // }
      return item
    }
  })

  return validModel
}

export function getValidRoleModelNames (model: IViewModel[], modelNames: string[]) {
  if (!Array.isArray(modelNames)) { return [] }

  const validModelNames = modelNames.filter((name) => model.findIndex((m) => m.name === name) >= 0)
  return validModelNames
}

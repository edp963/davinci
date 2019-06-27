import { IViewModel, ISqlColumn, IView, IFormedView, IViewRoleRaw, IViewRole } from './types'

import { SqlTypes } from 'app/globalConstants'
import { ModelTypeSqlTypeSetting, VisualTypeSqlTypeSetting, ViewModelVisualTypes, ViewModelTypes } from './constants'

export function getFormedView (view: IView): IFormedView {
  const { model, variable, roles } = view
  const formedView = {
    ...view,
    model: JSON.parse((model || '{}')),
    variable: JSON.parse((variable || '[]')),
    roles: (roles as IViewRoleRaw[]).map<IViewRole>(({ roleId, columnAuth, rowAuth }) => ({
      roleId,
      columnAuth: JSON.parse(columnAuth || '[]'),
      rowAuth: JSON.parse(rowAuth || '[]')
    }))
  }
  return formedView
}

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

export function getValidModel (model: IViewModel, sqlColumns: ISqlColumn[]) {
  if (!Array.isArray(sqlColumns)) { return {} }

  const validModel = sqlColumns.reduce<IViewModel>((accModel, column) => {
    const { name: columnName, type: columnType } = column
    const modelItem = model[columnName]
    if (!modelItem) {
      accModel[columnName] = {
        sqlType: columnType,
        visualType: getMapKeyByValue(columnType, VisualTypeSqlTypeSetting) || ViewModelVisualTypes.String,
        modelType: getMapKeyByValue(columnType, ModelTypeSqlTypeSetting) || ViewModelTypes.Category
      }
    } else {
      accModel[columnName] = { ...modelItem }
      // @TODO verify modelType & visualType are valid by the sqlType or not
      // if (!VisualTypeSqlTypeSetting[item.visualType].includes(columnType)) {
      //   needNotify = true
      //   item.visualType = getMapKeyByValue(columnType, VisualTypeSqlTypeSetting)
      // }
      // if (!ModelTypeSqlTypeSetting[item.modelType].includes(columnType)) {
      //   needNotify = true
      //   item.modelType = getMapKeyByValue(columnType, ModelTypeSqlTypeSetting)
      // }
    }
    return accModel
  }, {})

  return validModel
}

export function getValidRoleModelNames (model: IViewModel, modelNames: string[]) {
  if (!Array.isArray(modelNames)) { return [] }

  const validModelNames = modelNames.filter((name) => !!model[name])
  return validModelNames
}

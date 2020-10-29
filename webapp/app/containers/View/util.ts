import { IViewModel, ISqlColumn, IView, IFormedView, IViewRoleRaw, IViewRole, IKeyOfViewModelProps } from './types'

import { SqlTypes } from 'app/globalConstants'
import { DefaultModelTypeSqlTypeSetting, VisualTypeSqlTypeSetting, ViewModelVisualTypes, ViewModelTypes } from './constants'
import { hasProperty } from 'utils/util'


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

function getMapKeyByValue (value: SqlTypes, map: typeof VisualTypeSqlTypeSetting | typeof DefaultModelTypeSqlTypeSetting) {
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

        // model item which columnType not registered with SQL_TYPES in globalConstants.ts
        // its default visualType is String and modelType is Category
        visualType: getMapKeyByValue(columnType, VisualTypeSqlTypeSetting) || ViewModelVisualTypes.String,
        modelType: getMapKeyByValue(columnType, DefaultModelTypeSqlTypeSetting) || ViewModelTypes.Category
      }
    } else {
      accModel[columnName] = { ...modelItem, sqlType: columnType } // update newest sqlType
      // verify visualType are valid by the sqlType or not
      // @TODO recover visualType validation after filter visualType select options by columnType in step2
      // if (SQL_TYPES.includes(columnType)) { // model item which columnType not registered with SQL_TYPES do not need verify
      //   if (VisualTypeSqlTypeSetting[modelItem.visualType]
      //       && !VisualTypeSqlTypeSetting[modelItem.visualType].includes(columnType)) {
      //     accModel[columnName].visualType = getMapKeyByValue(columnType, VisualTypeSqlTypeSetting)
      //   }
      // }
      // @TODO changed visualType need be shown in step2 corresponding model table cell
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


export function getTypesOfModelCollect (model: IViewModel, type: IKeyOfViewModelProps) {
  let target = {}
  if (model) {
    return target = Object.keys(model).reduce((iteratee, current) => {
      iteratee[current] = hasProperty(model[current], type)
      return iteratee
    }, {})
  }
  return target
}


function cacheManager (model: IViewModel, type: IKeyOfViewModelProps) {
  const cache = {}
  return function (name: string, callback) {
    if (cache['prevModel'] === model) {
      cache[type] = cache[type] || getTypesOfModelCollect(model, type)
    } else {
      cache['prevModel'] = model
      cache[type] = getTypesOfModelCollect(model, type)
    }
    return callback(cache)
  }
}

export const getTypesOfModelByKeyName = (model: IViewModel, type: IKeyOfViewModelProps) => (name: string) => {
  return cacheManager(model, type)(name, (cache) => {
    if (cache && cache[type]) {
      return hasProperty(cache[type], name)
    }
  })
}


export const getListsByViewModelTypes = (model: IViewModel, type: IKeyOfViewModelProps) => (modelType: ViewModelTypes) => {
  return cacheManager(model, type)(name, (cache) => {
    const target = cache[type]
    return Object.keys(target).reduce((iteratee, current) => {
      return iteratee.concat(target[current] === modelType ? current : [])
    }, [])
  })
}

import moment from 'moment'
import { message } from 'antd'
import { IFieldConfig } from './types'
import { IQueryVariableMap } from 'app/containers/Dashboard/Grid'

export function getDefaultFieldConfig (): IFieldConfig {
  return {
    alias: '',
    desc: '',
    useExpression: false
  }
}

export function extractQueryVariableNames (expression: string, withBoundaryToken: boolean = false) {
  const names = []
  if (!expression) { return names }
  const varReg = /\$(\w+)\$/g
  expression.replace(varReg, (match: string, p: string) => {
    const name = withBoundaryToken ? match : p
    if (!names.includes(name)) {
      names.push(name)
    }
    return name
  })
  return names
}

export function getFieldAlias (fieldConfig: IFieldConfig, queryVariableMap: IQueryVariableMap) {
  if (!fieldConfig) { return '' }

  const { alias, useExpression } = fieldConfig
  if (!useExpression) { return alias }

  const queryKeys = extractQueryVariableNames(alias, true)
  const keys = []
  const vals = []
  queryKeys.forEach((queryKey) => {
    keys.push(queryKey)
    const queryValue = queryVariableMap[queryKey]
    if (queryValue === undefined) {
      vals.push('')
    } else {
      vals.push(
        typeof queryValue === 'number'
          ? queryValue
          : queryValue.replace(/^(['"])|(['"])$/g, ''))
    }
  })

  const Moment = moment
  let funcBody = alias
  if (!alias.includes('return')) {
    funcBody = 'return ' + funcBody
  }
  const paramNames = ['Moment', ...keys, funcBody]
  try {
    const func = Function.apply(null, paramNames)
    const params = [Moment, ...vals]
    const dynamicAlias: string = func(...params)
    return dynamicAlias
  } catch (e) {
    message.error(`字段别名转换错误：${e.message}`)
  }
}

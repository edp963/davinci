/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

import { ITableCellStyle, ITableColumnConfig, DefaultTableCellStyle } from 'containers/Widget/components/Config/Table'
import { getTextWidth } from 'utils/util'
import { IFieldFormatConfig, getFormattedValue } from 'containers/Widget/components/Config/Format'

export function traverseConfig<T> (config: T[], childrenName: keyof T, callback: (currentConfig: T, idx: number, siblings: T[]) => any) {
  if (!Array.isArray(config)) { return }

  config.forEach((cfg, idx) => {
    if (Array.isArray(cfg[childrenName])) {
      const children = cfg[childrenName as string] as T[]
      if (children.length > 0) {
        traverseConfig(children, childrenName, callback)
      }
    }
    callback(cfg, idx, config)
  })
}

export function findChildConfig<T> (
  config: T[],
  keyName: keyof T,
  childrenName: keyof T,
  keyValue: valueof<T>,
  callback: (config: T) => any
) {
  if (!Array.isArray(config)) { return false }

  const hasFound = config.some((cfg) => {
    if (cfg[keyName] === keyValue) {
      callback(cfg)
      return true
    }
    const children = cfg[childrenName]
    if (Array.isArray(children) && children.length > 0) {
      return findChildConfig(children, keyName, childrenName, keyValue, callback)
    }
    return false
  })

  return hasFound
}

export function textAlignAdapter (justifyContent: ITableCellStyle['justifyContent']) {
  switch (justifyContent) {
    case 'flex-start': return 'left'
    case 'center':  return 'center'
    case 'flex-end': return 'right'
    default: return 'inherit'
  }
}

export function getMergedCellSpan (data: any[], propName: string, idx: number) {
  const currentRecord = data[idx]
  const prevRecord = data[idx - 1]
  if (prevRecord && prevRecord[propName] === currentRecord[propName]) {
    return 0
  }
  let span = 1
  while (true) {
    const nextRecord = data[idx + span]
    if (nextRecord && nextRecord[propName] === currentRecord[propName]) {
      span++
    } else {
      break
    }
  }
  return span
}

export function computeCellWidth (style: ITableCellStyle, cellValue: string | number) {
  const { fontWeight, fontSize, fontFamily } = style || DefaultTableCellStyle
  const cellWidth = !cellValue ? 0 : getTextWidth(cellValue.toString(), fontWeight, `${fontSize}px`, fontFamily)
  return cellWidth + 16 + 2
}

export function getDataColumnWidth (expression: string, columnConfig: ITableColumnConfig, format: IFieldFormatConfig, data: any[]) {
  if (!data.length) { return 0 }
  const style = columnConfig && columnConfig.style
  let values = data.map((record) => record[expression])
  values = values.filter((value, idx) => values.indexOf(value) === idx)
  const maxCellWidth = values.reduce((w, value) => {
    const formattedValue = getFormattedValue(value, format)
    const cellWidth = computeCellWidth(style, formattedValue)
    return Math.max(w, cellWidth)
  }, 0)
  return maxCellWidth
}

export function getTableCellValueRange (data: any[], propName: string, columnConfig?: ITableColumnConfig): [number, number] {
  if (data.length <= 0) { return [0, 0] }

  let minVal = Infinity
  let maxVal = -Infinity

  if (columnConfig) {
    const { conditionStyles } = columnConfig
    conditionStyles.forEach((style) => {
      if (!style.bar) { return }
      const { mode, min, max } = style.bar
      if (mode === 'auto') { return }
      if (typeof min === 'number') { minVal = min }
      if (typeof max === 'number') { maxVal = max }
    })
  } else {
    return [0, 0]
  }

  const validMinVal = minVal !== Infinity
  const validMaxVal = maxVal !== -Infinity

  if (validMinVal && validMaxVal) {
    return [minVal, maxVal]
  }

  data.forEach((item) => {
    const cellVal = item[propName]
    if (typeof cellVal !== 'number' && (typeof cellVal !== 'string' || isNaN(+cellVal))) { return }

    const cellNumVal = +cellVal
    if (!validMinVal && cellNumVal < minVal) { minVal = cellNumVal }
    if (!validMaxVal && cellNumVal > maxVal) { maxVal = cellNumVal }
  })
  return [minVal, maxVal]
}

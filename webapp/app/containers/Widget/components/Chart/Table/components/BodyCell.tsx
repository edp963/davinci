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

import React from 'react'
import OperatorTypes from 'utils/operatorTypes'
import { ITableColumnConfig, ITableConditionStyle, DefaultTableCellStyle } from 'containers/Widget/components/Config/Table'
import { IFieldFormatConfig, getFormattedValue } from 'containers/Widget/components/Config/Format'
import { TableConditionStyleTypes } from 'containers/Widget/components/Config/Table/Column'
import { textAlignAdapter } from '../util'

interface IBodyCellProps {
  format: IFieldFormatConfig
  config: ITableColumnConfig
  cellVal: string | number
  cellValRange: [number, number]
  children: Array<string | number | boolean>
}

function BodyCell (props: IBodyCellProps) {
  const { format, config, cellVal, cellValRange, ...rest } = props
  const cellCssStyle = getBodyCellStyle(config, cellVal, cellValRange)
  if (format) {
    const formattedVal = getFormattedValue(cellVal, format)
    return (
      <td style={cellCssStyle} {...rest}>{formattedVal}</td>
    )
  }
  return (
    <td style={cellCssStyle} {...rest} />
  )
}

export default BodyCell

function getBodyCellStyle (columnConfig: ITableColumnConfig, cellVal: string | number, cellValRange: [number, number]) {
  const basicStyle = getBasicStyledCell(columnConfig)
  const conditionStyle = getMergedConditionStyledCell(basicStyle, cellVal, columnConfig, cellValRange)
  const cellStyle = { ...basicStyle, ...conditionStyle }
  return cellStyle
}

function getBasicStyledCell (columnConfig: ITableColumnConfig) {
  const style = columnConfig ? columnConfig.style : DefaultTableCellStyle
  const { fontSize, fontFamily, fontWeight, fontColor, fontStyle, backgroundColor, justifyContent } = style
  const cssStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    fontFamily,
    fontWeight: fontWeight as React.CSSProperties['fontWeight'],
    color: fontColor,
    fontStyle,
    backgroundColor,
    textAlign: textAlignAdapter(justifyContent)
  }
  return cssStyle
}

function hasMatchedTheCondition (
  cellVal: string | number,
  operatorType: OperatorTypes,
  conditionValues: Array<string | number>
) {
  let matchTheCondition = false
  switch (operatorType) {
    case OperatorTypes.Between:
      const [minVal, maxVal] = conditionValues
      matchTheCondition = (cellVal >= minVal && cellVal <= maxVal)
      break
    case OperatorTypes.Contain:
      matchTheCondition = cellVal.toString().indexOf(conditionValues[0].toString()) >= 0
      break
    case OperatorTypes.Equal:
      matchTheCondition = (cellVal === conditionValues[0])
      break
    case OperatorTypes.GreaterThan:
      matchTheCondition = (cellVal > conditionValues[0])
      break
    case OperatorTypes.GreaterThanOrEqual:
      matchTheCondition = (cellVal >= conditionValues[0])
      break
    case OperatorTypes.In:
      matchTheCondition = conditionValues.findIndex((cVal) => cVal === cellVal) >= 0
      break
    case OperatorTypes.LessThan:
      matchTheCondition = (cellVal < conditionValues[0])
      break
    case OperatorTypes.LessThanOrEqual:
      matchTheCondition = (cellVal <= conditionValues[0])
      break
    case OperatorTypes.NotEqual:
      matchTheCondition = (cellVal !== conditionValues[0])
      break
  }
  return matchTheCondition
}

function getBackgroundConditionCellStyle (
  conditionStyle: ITableConditionStyle
): React.CSSProperties {
  const { colors } = conditionStyle
  const { fore, background } = colors
  const cssStyle: React.CSSProperties = {
    color: fore,
    backgroundColor: background
  }
  return cssStyle
}

function getTextConditionCellStyle (
  conditionStyle: ITableConditionStyle
): React.CSSProperties {
  const { colors } = conditionStyle
  const { fore } = colors
  const cssStyle: React.CSSProperties = {
    color: fore
  }
  return cssStyle
}

function getNumericBarConditionCellStyle (
  basicStyle: React.CSSProperties,
  conditionStyle: ITableConditionStyle,
  cellVal: number,
  maxCellVal: number,
  minCellVal: number
): React.CSSProperties {
  const { zeroPosition, colors } = conditionStyle
  const { fore, positive, negative } = colors

  const valRange = (Math.max(maxCellVal, 0) - Math.min(0, minCellVal))
  let cellBarPercentage: number = void 0
  if (cellVal < minCellVal) {
    cellBarPercentage = 0
  } else if (cellVal > maxCellVal) {
    cellBarPercentage = 100
  }
  let barZeroPosition: number
  switch (zeroPosition) {
    case 'center':
      if (cellBarPercentage === void 0) {
        cellBarPercentage = Math.abs(cellVal) / Math.max(Math.abs(minCellVal), Math.abs(maxCellVal)) * 50
      }
      barZeroPosition = 50
      break
    case 'auto':
      if (cellBarPercentage === void 0) {
        cellBarPercentage = (Math.abs(cellVal) / valRange) * 100
      }
      barZeroPosition = Math.abs(Math.min(0, minCellVal)) / (Math.abs(minCellVal) + Math.abs(maxCellVal)) * 100
      break
  }

  const backgroundColor = basicStyle.backgroundColor || 'transparent'
  const divisions = [`${backgroundColor} 0%`]
  if (cellVal < 0) {
    divisions.push(`${backgroundColor} ${barZeroPosition - cellBarPercentage}%`)
    divisions.push(`${negative} ${barZeroPosition - cellBarPercentage}%`)
    divisions.push(`${negative} ${barZeroPosition}%`)
    divisions.push(`${backgroundColor} ${barZeroPosition}%`)
  } else {
    divisions.push(`${backgroundColor} ${barZeroPosition}%`)
    divisions.push(`${positive} ${barZeroPosition}%`)
    divisions.push(`${positive} ${barZeroPosition + cellBarPercentage}%`)
    divisions.push(`${backgroundColor} ${barZeroPosition + cellBarPercentage}%`)
  }
  divisions.push(`${backgroundColor} 100%`)

  const cssStyle: React.CSSProperties = {
    color: fore,
    background: `linear-gradient(90deg, ${divisions.join(',')})`
  }
  return cssStyle
}

function getConditionStyledCell (
  basicStyle: React.CSSProperties,
  cellVal: string | number,
  conditionStyle: ITableConditionStyle,
  cellValRange?: [number, number]
) {
  const { operatorType, conditionValues, type } = conditionStyle
  const matchTheCondition = hasMatchedTheCondition(cellVal, operatorType, conditionValues)
  if (!matchTheCondition) { return null }

  let cssStyle: React.CSSProperties
  switch (type) {
    case TableConditionStyleTypes.BackgroundColor:
      cssStyle = getBackgroundConditionCellStyle(conditionStyle)
      break
    case TableConditionStyleTypes.TextColor:
      cssStyle = getTextConditionCellStyle(conditionStyle)
      break
    case TableConditionStyleTypes.NumericBar:
      const [minCellVal, maxCellVal] = cellValRange
      cssStyle = getNumericBarConditionCellStyle(basicStyle, conditionStyle, +cellVal, maxCellVal, minCellVal)
      break
    case TableConditionStyleTypes.Custom:
      // @TODO
      break
  }

  return cssStyle
}

function getMergedConditionStyledCell (
  basicStyle: React.CSSProperties,
  cellVal: string | number,
  columnConfig: ITableColumnConfig,
  cellValRange?: [number, number]
): React.CSSProperties {
  if (!columnConfig) { return null }

  const { styleType, conditionStyles } = columnConfig
  let conditionCellStyle: React.CSSProperties
  if (conditionStyles.length > 0) {
    conditionCellStyle = conditionStyles.reduce((acc, c) => ({
      ...acc,
      ...getConditionStyledCell(basicStyle, cellVal, c, cellValRange)
    }), {})
  }
  return conditionCellStyle
}

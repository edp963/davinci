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
import { ColumnProps } from 'antd/lib/table'
import { Resizable } from 'libs/react-resizable'
import { ResizeCallbackData } from 'libs/react-resizable'
import { ITableHeaderConfig, DefaultTableCellStyle } from 'containers/Widget/components/Config/Table'
import { textAlignAdapter, traverseConfig } from '../util'

interface IHeadCellProps {
  onResize: (e: any, data: ResizeCallbackData) => any
  width: number
  config: ITableHeaderConfig
}

function HeadCell (props: IHeadCellProps) {
  const { onResize, width, config, ...rest } = props
  const cellStyle = config ? config.style : DefaultTableCellStyle
  const { fontColor: color, fontFamily, fontSize, fontStyle, fontWeight, backgroundColor, justifyContent } = cellStyle || DefaultTableCellStyle
  const cellCssStyle: React.CSSProperties = {
    color,
    fontFamily,
    fontSize: `${fontSize}px`,
    fontStyle,
    fontWeight: fontWeight as React.CSSProperties['fontWeight'],
    backgroundColor,
    textAlign: textAlignAdapter(justifyContent)
  }
  return (
    <Resizable width={width} height={0} onResize={onResize}>
      <th style={cellCssStyle} {...rest} />
    </Resizable>
  )
}

export function resizeTableColumns (columns: Array<ColumnProps<any>>, columnIndex: number, width: number, ratio: number) {
  const nextColumns = [...columns]
  const resizedColumn = nextColumns[columnIndex]
  nextColumns[columnIndex] = {
    ...resizedColumn,
    width
  }
  traverseConfig(resizedColumn.children, 'children', (childColumn) => {
    childColumn.width = ratio * (+childColumn.width)
  })
  return nextColumns
}

export default HeadCell

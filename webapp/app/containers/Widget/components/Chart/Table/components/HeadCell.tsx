import React from 'react'
import { Resizable } from 'libs/react-resizable'
import { IResizeCallbackData } from 'libs/react-resizable/lib/Resizable'
import { ITableHeaderConfig } from '../../../Workbench/ConfigSections/TableSection'
import { DefaultTableCellStyle } from '../../../Workbench/ConfigSections/TableSection/HeaderConfigModal'
import { textAlignAdapter } from '../util'

interface IHeadCellProps {
  onResize: (e: any, data: IResizeCallbackData) => any
  width: number
  config: ITableHeaderConfig
}

function HeadCell (props: IHeadCellProps) {
  const { onResize, width, config, ...rest } = props
  const headStyleConfig = config ? config.style : DefaultTableCellStyle
  const { fontColor: color, fontFamily, fontSize, fontStyle, fontWeight, backgroundColor, justifyContent } = headStyleConfig
  const headCellStyle: React.CSSProperties = {
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
      <th style={headCellStyle} {...rest} />
    </Resizable>
  )
}

export default HeadCell

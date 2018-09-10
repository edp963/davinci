import * as React from 'react'
import { ChromePicker } from 'react-color'
const Popover = require('antd/lib/popover')
const styles = require('./ColorPicker.less')

interface IColorPickerProps {
  value: string
  onChange: (value: string) => void
}

export function ColorPicker (props: IColorPickerProps) {
  return (
    <Popover
      content={
        <div style={{margin: '-8px -16px'}}>
          <ChromePicker
            disableAlpha={true}
            color={props.value}
            onChangeComplete={colorChange(props)}
          />
        </div>}
      trigger="click"
      placement="right"
    >
      <div className={styles.picker}>
        <span className={styles.colorIndicator} style={{background: props.value}} />
      </div>
    </Popover>
  )
}

function colorChange (props: IColorPickerProps) {
  return function ({hex}) {
    props.onChange(hex)
  }
}

export default ColorPicker

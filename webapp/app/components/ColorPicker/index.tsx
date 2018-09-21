import * as React from 'react'
import { SketchPicker } from 'react-color'
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
          <SketchPicker
            color={props.value}
            presetColors={[]}
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
  return function ({rgb}) {
    const { r, g, b, a } = rgb
    props.onChange(`rgba(${r}, ${g}, ${b}, ${a})`)
  }
}

export default ColorPicker

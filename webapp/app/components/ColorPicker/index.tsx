import * as React from 'react'
import * as classnames from 'classnames'
import { SketchPicker } from 'react-color'
import { Popover } from 'antd'
const styles = require('./ColorPicker.less')

interface IColorPickerProps {
  value: string
  disableAlpha?: boolean
  className?: string
  onChange: (value: string) => void
}

export function ColorPicker (props: IColorPickerProps) {
  const cls = !props.className ? styles.picker
    : classnames({
      [styles.picker]: true,
      [props.className]: true
    })
  return (
    <Popover
      content={
        <div style={{margin: '-8px -16px'}}>
          <SketchPicker
            color={props.value}
            presetColors={[]}
            onChangeComplete={colorChange(props)}
            disableAlpha={props.disableAlpha}
          />
        </div>}
      trigger="click"
      placement="right"
    >
      <div className={cls}>
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

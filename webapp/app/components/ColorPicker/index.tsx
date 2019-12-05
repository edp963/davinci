import React, { useCallback } from 'react'
import classnames from 'classnames'
import { SketchPicker, ColorResult } from 'react-color'
import { Popover } from 'antd'
const styles = require('./ColorPicker.less')

interface IColorPickerProps {
  value?: string
  size?: 'default' | 'small' | 'large'
  disableAlpha?: boolean
  className?: string
  onChange?: (value: string) => void
}

const ColorPicker: React.FC<IColorPickerProps> = (props) => {
  const { value, size, disableAlpha, className, onChange } = props

  const cls = classnames({
    [styles.picker]: true,
    [className]: !!className,
    [`${styles.picker}-sm`]: size && size === 'small',
    [`${styles.picker}-lg`]: size && size === 'large'
  })

  const colorChange = useCallback((e: ColorResult) => {
    const { r, g, b, a } = e.rgb
    onChange(`rgba(${r}, ${g}, ${b}, ${a})`)
  }, [onChange])

  return (
    <Popover
      content={
        <div style={{margin: '-8px -16px'}}>
          <SketchPicker
            color={value}
            presetColors={[]}
            onChangeComplete={colorChange}
            disableAlpha={disableAlpha}
          />
        </div>}
      trigger="click"
      placement="right"
    >
      <div className={cls}>
        <span className={styles.colorIndicator} style={{background: value}} />
      </div>
    </Popover>
  )
}

export type ColorPickerProps = IColorPickerProps
export default ColorPicker

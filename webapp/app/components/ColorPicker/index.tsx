import React, {
  useCallback,
  RefForwardingComponent,
  PropsWithChildren,
  useMemo
} from 'react'
import classnames from 'classnames'
import { SketchPicker, ColorResult } from 'react-color'
import { Popover } from 'antd'
const styles = require('./ColorPicker.less')

interface IColorPickerProps {
  value?: string | [number, number, number, number]
  size?: 'default' | 'small' | 'large'
  disableAlpha?: boolean
  rawValue?: boolean
  className?: string
  onChange?: (value: string | [number, number, number, number]) => void
}

const ColorPicker: RefForwardingComponent<
  Popover,
  PropsWithChildren<IColorPickerProps>
> = (props, ref) => {
  const { value, size, disableAlpha, rawValue, className, onChange } = props

  const cls = classnames({
    [styles.picker]: true,
    [className]: !!className,
    [`${styles.picker}-sm`]: size && size === 'small',
    [`${styles.picker}-lg`]: size && size === 'large'
  })

  const colorChange = useCallback(
    (e: ColorResult) => {
      const { r, g, b, a } = e.rgb
      onChange(rawValue ? [r, g, b, a] : `rgba(${r}, ${g}, ${b}, ${a})`)
    },
    [onChange, rawValue]
  )

  const color = useMemo(
    (): string =>
      rawValue && value
        ? `rgba(${(value as [number, number, number, number]).join()})`
        : (value as string),
    [value, rawValue]
  )

  return (
    <Popover
      ref={ref}
      content={
        <div style={{ margin: '-8px -16px' }}>
          <SketchPicker
            color={color}
            presetColors={[]}
            onChangeComplete={colorChange}
            disableAlpha={disableAlpha}
          />
        </div>
      }
      trigger="click"
      placement="right"
    >
      {props.children || (
        <div className={cls}>
          <span
            className={styles.colorIndicator}
            style={{ background: color }}
          />
        </div>
      )}
    </Popover>
  )
}

export type ColorPickerProps = IColorPickerProps
export default React.forwardRef(ColorPicker)

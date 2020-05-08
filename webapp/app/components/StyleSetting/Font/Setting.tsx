import React, { useState, useCallback, forwardRef } from 'react'

import { IFontSetting, FontStyles } from './types'
import { fontSelect, EmptyFontSetting } from './constants'

import { SelectProps } from 'antd/lib/select'
import { ColorPickerProps } from 'components/ColorPicker'

import Styles from './Font.less'

interface IFontSettingProps {
  value?: IFontSetting
  size?: SelectProps['size']
  pathPrefix?: string
  onChange?: (setting: IFontSetting, pathPrefix?: string) => void
}

const FontSetting: React.FC<IFontSettingProps> = (props, ref) => {
  const { value, size: containerSize, pathPrefix, onChange } = props
  const { fontFamily, fontStyle, fontSize, fontWeight, fontColor } = value || EmptyFontSetting

  const [family, setFamily] = useState(fontFamily)
  const [style, setStyle] = useState(fontStyle)
  const [size, setSize] = useState(fontSize)
  const [weight, setWeight] = useState(fontWeight)
  const [color, setColor] = useState(fontColor)

  const triggerChange = useCallback(
    (changedValue: Partial<IFontSetting>) => {
      if (onChange) {
        onChange(
          { fontFamily, fontStyle, fontSize, fontWeight, fontColor, ...changedValue },
          pathPrefix
        )
      }
    },
    [onChange, pathPrefix, value]
  )

  const fontFamilySelect = React.cloneElement<SelectProps<string>>(
    fontSelect.family,
    {
      value: family,
      size: containerSize,
      className: Styles.width1,
      onChange: (value) => {
        setFamily(value)
        triggerChange({ fontFamily: value })
      }
    }
  )

  const fontStyleSelect = React.cloneElement<SelectProps<string>>(
    fontSelect.style,
    {
      value: style,
      size: containerSize,
      className: Styles.width2,
      onChange: (value: FontStyles) => {
        setStyle(value)
        triggerChange({ fontStyle: value })
      }
    }
  )

  const fontSizeSelect = React.cloneElement<SelectProps<string>>(
    fontSelect.size,
    {
      value: size,
      size: containerSize,
      className: Styles.width2,
      onChange: (value) => {
        setSize(value)
        triggerChange({ fontSize: value })
      }
    }
  )

  const fontWeightSelect = React.cloneElement<SelectProps<string>>(
    fontSelect.weight,
    {
      value: weight,
      size: containerSize,
      className: Styles.width3,
      onChange: (value) => {
        setWeight(value)
        triggerChange({ fontWeight: value })
      }
    }
  )

  const fontColorPicker = React.cloneElement<ColorPickerProps>(
    fontSelect.color,
    {
      value: color,
      size: containerSize,
      onChange: (value: string) => {
        setColor(value)
        triggerChange({ fontColor: value })
      }
    }
  )

  return (
    <div className={Styles.setting} ref={ref}>
      {fontFamilySelect}
      {fontStyleSelect}
      {fontSizeSelect}
      {fontWeightSelect}
      <div className={Styles.colorWrapper}>{fontColorPicker}</div>
    </div>
  )
}

export default React.memo(forwardRef(FontSetting))

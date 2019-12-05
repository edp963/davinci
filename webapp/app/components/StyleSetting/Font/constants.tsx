import React from 'react'

import { Select } from 'antd'
const { Option } = Select
import ColorPicker from 'components/ColorPicker'

import { IFontSetting } from './types'
import {
  PIVOT_CHART_FONT_FAMILIES,
  PIVOT_CHART_FONT_SIZES,
  PIVOT_CHART_FONT_WEIGHTS,
  PIVOT_CHART_FONT_STYLE,
  PIVOT_DEFAULT_FONT_COLOR,
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_STYLE,
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_WEIGHT
} from 'app/globalConstants'

const weight = (
  <Select dropdownMatchSelectWidth={false}>
    {PIVOT_CHART_FONT_WEIGHTS.map((w) => (
      <Option value={w} key={w}>
        {w}
      </Option>
    ))}
  </Select>
)

const style = (
  <Select dropdownMatchSelectWidth={false}>
    {PIVOT_CHART_FONT_STYLE.map((s) => (
      <Option value={s.value} key={s.value}>
        {s.name}
      </Option>
    ))}
  </Select>
)

const family = (
  <Select dropdownMatchSelectWidth={false}>
    {PIVOT_CHART_FONT_FAMILIES.map((f) => (
      <Option value={f.value} key={f.value}>
        {f.name}
      </Option>
    ))}
  </Select>
)

const size = (
  <Select dropdownMatchSelectWidth={false}>
    {PIVOT_CHART_FONT_SIZES.map((s) => (
      <Option value={s.toString()} key={`${s}`}>
        {s}
      </Option>
    ))}
  </Select>
)

const color = (
  <ColorPicker />
)

export const fontSelect = {
  weight,
  style,
  family,
  size,
  color
}

export const EmptyFontSetting: IFontSetting = {
  fontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
  fontStyle: DEFAULT_FONT_STYLE,
  fontSize: DEFAULT_FONT_SIZE,
  fontWeight: DEFAULT_FONT_WEIGHT,
  fontColor: PIVOT_DEFAULT_FONT_COLOR
}

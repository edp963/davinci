
import React from 'react'

import { Select } from 'antd'
const { Option } = Select

import {
  PIVOT_CHART_FONT_FAMILIES,
  PIVOT_CHART_FONT_SIZES,
  PIVOT_CHART_FONT_WEIGHTS,
  PIVOT_CHART_FONT_STYLE,
  PIVOT_DEFAULT_FONT_COLOR,
  DEFAULT_FONT_STYLE} from 'app/globalConstants'
import { ITableCellStyle } from './types'

export const DEFAULT_TABLE_FIXED_WIDTH = 100

export const fontWeightOptions = PIVOT_CHART_FONT_WEIGHTS.map((w) => (
  <Option value={w} key={w}>{w}</Option>
))

export const fontStyleOptions = PIVOT_CHART_FONT_STYLE.map((s) => (
  <Option value={s.value} key={s.value}>{s.name}</Option>
))

export const fontFamilyOptions = PIVOT_CHART_FONT_FAMILIES.map((f) => (
  <Option value={f.value} key={f.value}>{f.name}</Option>
))

export const fontSizeOptions = PIVOT_CHART_FONT_SIZES.map((s) => (
  <Option value={s.toString()} key={`${s}`}>{s}</Option>
))

export const DefaultTableCellStyle: ITableCellStyle = {
  fontSize: '12',
  fontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
  fontWeight: PIVOT_CHART_FONT_WEIGHTS[0],
  fontColor: PIVOT_DEFAULT_FONT_COLOR,
  fontStyle: DEFAULT_FONT_STYLE,
  backgroundColor: 'transparent',
  justifyContent: 'flex-start',
  inflexible: false,
  width: DEFAULT_TABLE_FIXED_WIDTH
}

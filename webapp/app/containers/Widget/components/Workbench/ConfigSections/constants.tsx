import React from 'react'
import { Select } from 'antd'
const Option = Select.Option
import { PIVOT_CHART_FONT_FAMILIES, PIVOT_CHART_FONT_SIZES, CHART_SORT_MODES, CHART_ALIGNMENT_MODES, CHART_LAYER_TYPES, CHART_LINES_SYMBOL_TYPE } from 'app/globalConstants'

export const chartFontFamilyOptions = PIVOT_CHART_FONT_FAMILIES.map((f) => (
  <Option value={f.value} key={f.value}>
    {f.name}
  </Option>
))

export const chartFontSizeOptions = PIVOT_CHART_FONT_SIZES.map((f) => (
  <Option key={f} value={`${f}`}>
    {f}
  </Option>
))

export const chartSortModeOptions = CHART_SORT_MODES.map((f) => (
  <Option key={f.value} value={f.value}>{f.name}</Option>
))

export const chartAlignmentModeOptions = CHART_ALIGNMENT_MODES.map((f) => (
  <Option key={f.value} value={f.value}>{f.name}</Option>
))

export const chartLayerTypeOptions = CHART_LAYER_TYPES.map((p) => (
  <Option key={p.value} value={p.value}>{p.name}</Option>
))

export const chartSymbolTypeOptions = CHART_LINES_SYMBOL_TYPE.map((p) => (
  <Option key={p.value} value={p.value}>{p.name}</Option>
))

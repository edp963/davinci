import React, { FC } from 'react'
import moment from 'moment'
import { IControlBase } from './types'
import { Input, Select, TreeSelect, DatePicker } from 'antd'
const Search = Input.Search
const Option = Select.Option
const { WeekPicker, MonthPicker, RangePicker } = DatePicker
import NumberRange from '../NumberRange'
const MultiDatePicker = React.lazy(() => import('../MultiDatePicker'))
import { DatePickerFormats } from './constants'
import styles from './Layouts/Layouts.less'

export function renderInputText (value, size, onChange, onSearch) {
  return (
    <Search
      placeholder="请输入"
      value={value}
      size={size}
      onChange={onChange}
      onSearch={onSearch}
    />
  )
}

export function renderNumberRange (value, size, onChange, onSearch) {
  return (
    <NumberRange
      value={value}
      size={size}
      onChange={onChange}
      onSearch={onSearch}
    />
  )
}

export function renderSelect (
  control: IControlBase,
  value,
  size,
  onChange,
  options
) {
  const { multiple } = control
  return (
    <Select
      showSearch
      allowClear
      placeholder="请选择"
      value={value}
      size={size}
      onChange={onChange}
      dropdownMatchSelectWidth={false}
      {...multiple && {mode: 'multiple'}}
    >
      {options.map((o) => {
        return typeof o === 'object'
          ? <Option key={o.value} value={o.value}>{o.text}</Option>
          : <Option key={o} value={o}>{o}</Option>
      })}
    </Select>
  )
}

export function renderTreeSelect (filter: IControlBase, onChange, options) {
  // const { name, textColumn, valueColumn, parentColumn } = filter
  // const treeData = options.map((item) => ({
  //   id: item[valueColumn],
  //   pId: item[parentColumn],
  //   value: item[valueColumn],
  //   title: item[textColumn]
  // }))
  // return (
  //   <TreeSelect
  //     showSearch
  //     allowClear
  //     multiple
  //     treeDataSimpleMode
  //     placeholder="请选择"
  //     treeData={treeData}
  //     onChange={onChange}
  //   />
  // )
}

export function renderDate (
  control: IControlBase,
  value,
  size,
  onChange
) {
  const {
    Week,
    Month,
    Year,
    Datetime,
    DatetimeMinute
  } = DatePickerFormats
  const {
    multiple,
    dateFormat
  } = control
  const controlled = !!onChange
  if (multiple) {
    value = value || ''
    return (
      <MultiDatePicker
        placeholder="请选择"
        size={size}
        format={dateFormat}
        {...controlled && {value, onChange}}
      />
    )
  } else {
    value = moment.isMoment(value) ? value : null
    switch (dateFormat) {
      case Week:
        return (
          <WeekPicker
            className={styles.controlComponent}
            placeholder="请选择"
            size={size}
            {...controlled && {value, onChange}}
          />
        )
      case Month:
      case Year:
        return (
          <MonthPicker
            className={styles.controlComponent}
            placeholder="请选择"
            format={dateFormat}
            size={size}
            {...controlled && {value, onChange}}
          />
        )
      default:
        const isDatetimePicker = [Datetime, DatetimeMinute].includes(dateFormat)
        return (
          <DatePicker
            className={styles.controlComponent}
            placeholder="请选择"
            showTime={isDatetimePicker}
            format={dateFormat}
            size={size}
            {...controlled && {value}}
            {...controlled && {onChange: isDatetimePicker ? datetimePickerChange(onChange) : onChange}}
            {...controlled && {onOk: onChange}}
          />
        )
    }
  }
}

export function renderDateRange (control, value, size, onChange) {
  const { dateFormat } = control
  const placeholder: [string, string] = ['从', '到']
  const { Datetime, DatetimeMinute } = DatePickerFormats
  const isDatetimePicker = [Datetime, DatetimeMinute].includes(dateFormat)
  return (
    <RangePicker
      className={styles.controlComponent}
      placeholder={placeholder}
      value={value}
      size={size}
      showTime={isDatetimePicker}
      format={dateFormat}
      onChange={isDatetimePicker ? datetimePickerChange(onChange) : onChange}
      onOk={onChange}
    />
  )
}

function datetimePickerChange (onChange) {
  return function (val) {
    if (!val || (Array.isArray(val) && !val.length)) {
      onChange(val)
    }
  }
}

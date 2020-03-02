import React from 'react'
import { Input, Select, TreeSelect, DatePicker } from 'antd'
const Search = Input.Search
const Option = Select.Option
import NumberRange from '../NumberRange'
const MultiDatePicker = React.lazy(() => import('../MultiDatePicker'))
import DatePickerFormats from './datePickerFormats'
import { IGlobalControl } from './types'
const { WeekPicker, MonthPicker, RangePicker } = DatePicker

const styles = require('./filter.less')

export function renderInputText (onChange) {
  return (
    <Search placeholder="请输入" onSearch={onChange} />
  )
}

export function renderNumberRange (onChange) {
  return (
    <NumberRange onSearch={onChange} />
  )
}

export function renderSelect (control: IGlobalControl, onChange, options) {
  const { multiple } = control
  return (
    <Select
      showSearch
      allowClear
      placeholder="请选择"
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

export function renderTreeSelect (filter: IGlobalControl, onChange, options) {
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

export function renderDate (filter: IGlobalControl, onChange, extraProps?) {
  const {
    Week,
    Month,
    Year,
    Datetime,
    DatetimeMinute
  } = DatePickerFormats
  if (filter.multiple) {
    return (
      <MultiDatePicker
        placeholder="请选择"
        format={filter.dateFormat}
        {...onChange && {onChange}}
      />
    )
  } else {
    switch (filter.dateFormat) {
      case Week:
        return (
          <WeekPicker
            className={styles.controlComponent}
            placeholder="请选择"
            {...onChange && {onChange}}
            {...extraProps}
          />
        )
      case Month:
      case Year:
        return (
          <MonthPicker
            className={styles.controlComponent}
            placeholder="请选择"
            format={filter.dateFormat}
            {...onChange && {onChange}}
            {...extraProps}
          />
        )
      default:
        const isDatetimePicker = [Datetime, DatetimeMinute].includes(filter.dateFormat)
        return (
          <DatePicker
            className={styles.controlComponent}
            placeholder="请选择"
            showTime={isDatetimePicker}
            format={filter.dateFormat}
            {...onChange && {onChange: isDatetimePicker ? datetimePickerChange(onChange) : onChange}}
            {...onChange && {onOk: onChange}}
            {...extraProps}
          />
        )
    }
  }
}

export function renderDateRange (filter, onChange) {
  const placeholder: [string, string] = ['从', '到']
  const { Datetime, DatetimeMinute } = DatePickerFormats
  const isDatetimePicker = [Datetime, DatetimeMinute].includes(filter.dateFormat)
  return (
    <RangePicker
      className={styles.controlComponent}
      placeholder={placeholder}
      showTime={isDatetimePicker}
      format={filter.dateFormat}
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

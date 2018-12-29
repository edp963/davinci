import * as React from 'react'
import { WrappedFormUtils } from 'antd/lib/form/Form'
import { IFilterItem, OnGetFilterControlOptions, OnFilterControlValueChange, FilterControlOptions } from './'
import { FilterTypes, FilterTypesViewSetting } from './filterTypes'
import * as debounce from 'lodash/debounce'

import Input from 'antd/lib/input'
import InputNumber from 'antd/lib/input-number'
import Select from 'antd/lib/select'
const Option = Select.Option
import TreeSelect from 'antd/lib/tree-select'
import DatePicker from 'antd/lib/date-picker'
const RangePicker = DatePicker.RangePicker
import Form from 'antd/lib/form'
const FormItem = Form.Item

const styles = require('./filter.less')

import NumberRange from '../NumberRange'
import MultiDatePicker from '../MultiDatePicker'

interface IFilterControlProps {
  formToAppend: WrappedFormUtils
  filter: IFilterItem
  currentOptions: FilterControlOptions
  onGetOptions: OnGetFilterControlOptions
  onChange: OnFilterControlValueChange
}

export class FilterControl extends React.Component<IFilterControlProps, {}> {

  public componentWillMount () {
    const { filter, onChange } = this.props
    this.loadOptions(filter)
    this.debouncedOnChange = debounce(onChange, 800)
  }

  public componentWillReceiveProps (nextProps: IFilterControlProps) {
    const { filter, onChange } = nextProps
    if (filter && filter !== this.props.filter) {
      this.loadOptions(filter)
    }
    if (onChange !== this.props.onChange) {
      this.debouncedOnChange = debounce(this.props.onChange, 800)
    }
  }

  private loadOptions = (filter: IFilterItem) => {
    const { onGetOptions } = this.props
    if (!filter) { return }
    const { type } = filter
    if (!FilterTypesViewSetting[type]) { return } // @TODO 固定过滤项处理
    const { key, fromView, fromModel, fromText, fromChild, fromParent } = filter
    const columns = [fromModel, fromText]
    if (fromChild) { columns.push(fromChild) }
    if (fromParent) { columns.push(fromParent) }
    onGetOptions(key, fromView, columns, [])
  }

  private renderInputText = (filter, onChange) => {
    return (
      <Input placeholder={filter.name} onChange={onChange} />
    )
  }

  private renderInputNumber = (filter, onChange) => {
    return (
      <InputNumber style={{ width: '100%' }} placeholder={filter.name} onChange={onChange} />
    )
  }

  private renderNumberRange = (filter, onChange) => {
    return (
      <NumberRange placeholder={filter.name} onSearch={onChange} />
    )
  }

  private renderSelect = (filter, onChange, options) => {
    const { fromModel, fromText } = filter
    return (
      <Select allowClear={true} placeholder={filter.name} onChange={onChange}>
        {options.map((opt) => (<Option key={opt[fromModel]} value={opt[fromModel]}>{opt[fromText]}</Option>))}
      </Select>
    )
  }

  private renderMultiSelect = (filter, onChange, options) => {
    const { fromModel, fromText } = filter
    return (
      <Select mode="multiple" placeholder={filter.name} onChange={onChange}>
        {options.map((opt) => (<Option key={opt[fromModel]} value={opt[fromModel]}>{opt[fromText]}</Option>))}
      </Select>
    )
  }

  private renderTreeSelect = (filter: IFilterItem, onChange, options) => {
    const { fromModel, fromText, fromChild, fromParent } = filter
    const treeData = options.map((item) => ({
      id: item[fromChild],
      pId: item[fromParent],
      value: item[fromModel],
      title: item[fromText]
    }))
    return (
      <TreeSelect
        showSearch
        allowClear
        multiple
        treeDataSimpleMode
        treeData={treeData}
        onChange={onChange}
      />
    )
  }

  private renderCascadeSelect = () => {
    return void 0 // @TODO cascade select
  }

  private renderInputDate = (filter, onChange) => {
    return (
      <DatePicker placeholder={filter.name} format="YYYY-MM-DD" onChange={onChange}/>
    )
  }

  private renderMultiDate = (filter, onChange) => {
    return (
      <MultiDatePicker placeholder={filter.name} onChange={onChange} />
    )
  }

  private renderDateRange = (filter, onChange) => {
    const placeholder: [string, string] = [`${filter.name}从`, '到']
    return (
      <RangePicker format="YYYY-MM-DD" placeholder={placeholder} onChange={onChange} />
    )
  }

  private renderDatetime = (filter, onChange) => {
    const change = (val) => {
      if (!val.length) {
        onChange(val)
      }
    }
    return (
      <DatePicker
        placeholder={filter.name}
        format="YYYY-MM-DD HH:mm:ss"
        showTime={true}
        onOk={onChange}
        onChange={change}
      />
    )
  }

  private renderDatetimeRange = (filter, onChange) => {
    const placeholder: [string, string] = [`${filter.name}从`, '到']
    const change = (val) => {
      if (!val.length) {
        onChange(val)
      }
    }
    return (
      <RangePicker
        placeholder={placeholder}
        format="YYYY-MM-DD HH:mm:ss"
        showTime={true}
        onOk={onChange}
        onChange={change}
      />
    )
  }

  private wrapFormItem = (filter, form: WrappedFormUtils, control) => {
    const { getFieldDecorator } = form
    return (
      <FormItem wrapperCol={{span: 24}} className={styles.filterControl}>
        {getFieldDecorator(`${filter.key}`, {})(control)}
      </FormItem>
    )
  }

  private renderControl = (filter) => {
    const { currentOptions, formToAppend } = this.props
    const options = currentOptions || []
    let control
    switch (filter.type) {
      case FilterTypes.InputText:
        control = this.renderInputText(filter, this.onInputChange)
        break
      case FilterTypes.InputNumber:
        control = this.renderInputNumber(filter, this.change)
        break
      case FilterTypes.NumberRange:
        control = this.renderNumberRange(filter, this.change)
        break
      case FilterTypes.Select:
        control = this.renderSelect(filter, this.change, options)
        break
      case FilterTypes.MultiSelect:
        control = this.renderMultiSelect(filter, this.change, options)
        break
      case FilterTypes.TreeSelect:
        control = this.renderTreeSelect(filter, this.change, options)
        break
      case FilterTypes.CascadeSelect:
        control = this.renderCascadeSelect()
        break
      case FilterTypes.InputDate:
        control = this.renderInputDate(filter, this.change)
        break
      case FilterTypes.MultiDate:
        control = this.renderMultiDate(filter, this.change)
        break
      case FilterTypes.DateRange:
        control = this.renderDateRange(filter, this.change)
        break
      case FilterTypes.Datetime:
        control = this.renderDatetime(filter, this.change)
        break
      case FilterTypes.DatetimeRange:
        control = this.renderDatetimeRange(filter, this.change)
        break
    }
    return this.wrapFormItem(filter, formToAppend, control)
  }

  private change = (val) => {
    const { filter, onChange } = this.props
    onChange(filter, val)
  }

  private debouncedOnChange = null
  private onInputChange = (e) => {
    const { filter } = this.props
    let val = e.target.value
    if (val === '') { val = undefined }
    this.debouncedOnChange(filter, val)
  }

  public render () {
    const { filter } = this.props
    return this.renderControl(filter)
  }
}

export default FilterControl

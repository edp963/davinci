import React, { Suspense } from 'react'
import { WrappedFormUtils } from 'antd/lib/form/Form'
import {
  IFilterItem,
  OnGetFilterControlOptions,
  OnFilterControlValueChange,
  FilterControlOptions,
  renderInputText,
  renderNumberRange,
  renderSelect,
  renderTreeSelect,
  renderDate,
  renderDateRange,
  renderMultiDate,
  getDefaultValue
} from './'
import { FilterTypes, FilterTypesViewSetting } from './filterTypes'
import * as debounce from 'lodash/debounce'

import { Form } from 'antd'
const FormItem = Form.Item

const styles = require('./filter.less')

interface IFilterControlProps {
  formToAppend: WrappedFormUtils
  filter: IFilterItem
  currentOptions: FilterControlOptions
  parentValues?: Array<{column: string, value: any}>
  onGetOptions: OnGetFilterControlOptions
  onChange: OnFilterControlValueChange
}

export class FilterControl extends React.PureComponent<IFilterControlProps, {}> {

  public componentWillMount () {
    const { filter, parentValues, onGetOptions, onChange } = this.props
    this.loadOptions(filter, parentValues, onGetOptions)
    this.debouncedOnChange = debounce(onChange, 800)
  }

  public componentWillReceiveProps (nextProps: IFilterControlProps) {
    const { filter, parentValues, onGetOptions, onChange } = nextProps
    if (filter && filter !== this.props.filter) {
      this.loadOptions(filter, parentValues, onGetOptions)
    }
    if (this.compareParentValues(parentValues, this.props.parentValues)) {
      this.loadOptions(filter, parentValues, onGetOptions)
    }
    if (onChange !== this.props.onChange) {
      this.debouncedOnChange = debounce(this.props.onChange, 800)
    }
  }

  private compareParentValues = (current, prev) => {
    if (!current || !prev) {
      return false
    }
    const currentToString = current
      .map((c) => [c.column, c.value.toString()].join(String.fromCharCode(0)))
      .join(String.fromCharCode(0))
    const prevToString = prev
      .map((p) => [p.column, p.value.toString()].join(String.fromCharCode(0)))
      .join(String.fromCharCode(0))
    return currentToString !== prevToString
  }

  private loadOptions = (filter: IFilterItem, parentValues, onGetOptions) => {
    if (!filter) { return }
    const { type } = filter
    if (!FilterTypesViewSetting[type]) { return } // @TODO 固定过滤项处理
    const { key, fromView, fromModel, fromText, fromParent } = filter
    if (!fromView) { return }
    const columns = [fromModel, fromText]
    if (!columns.join('').length) { return }
    // if (fromChild) { columns.push(fromChild) }
    if (fromParent) { columns.push(fromParent) }
    onGetOptions(key, fromView, columns, parentValues)
  }

  private wrapFormItem = (filter: IFilterItem, form: WrappedFormUtils, control) => {
    const { getFieldDecorator } = form
    return (
      <FormItem className={styles.filterControl}>
        {getFieldDecorator(`${filter.key}`, {
          initialValue: getDefaultValue(filter)
        })(control)}
      </FormItem>
    )
  }

  private renderControl = (filter) => {
    const { currentOptions, formToAppend } = this.props
    const options = currentOptions || []
    let control
    switch (filter.type) {
      case FilterTypes.InputText:
        control = renderInputText(filter, this.onInputChange)
        break
      // case FilterTypes.InputNumber:
      //   control = this.renderInputNumber(filter, this.change)
      //   break
      case FilterTypes.NumberRange:
        control = renderNumberRange(filter, this.change)
        break
      case FilterTypes.Select:
        control = renderSelect(filter, this.change, options)
        break
      case FilterTypes.TreeSelect:
        control = renderTreeSelect(filter, this.change, options)
        break
      case FilterTypes.Date:
        control = renderDate(filter, this.change)
        break
      case FilterTypes.MultiDate:
        control = renderMultiDate(filter, this.change)
        break
      case FilterTypes.DateRange:
        control = renderDateRange(filter, this.change)
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
    return (
      <Suspense fallback={null}>
        {this.renderControl(filter)}
      </Suspense>
    )
  }
}

export default FilterControl

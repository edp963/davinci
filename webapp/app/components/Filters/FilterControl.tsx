import React, { Component, PureComponent, Suspense, ReactNode } from 'react'
import * as debounce from 'lodash/debounce'
import {
  IGlobalControl,
  OnFilterControlValueChange,
  ControlOptions,
  renderInputText,
  renderNumberRange,
  renderSelect,
  renderTreeSelect,
  renderDate,
  renderDateRange,
  getDefaultValue
} from './'
import { FilterTypes } from './filterTypes'
import { Form } from 'antd'
import { WrappedFormUtils } from 'antd/lib/form/Form'
const FormItem = Form.Item

const styles = require('./filter.less')

interface IParentInfo {
  control: IGlobalControl
  value: any
}

interface IFilterControlProps {
  form: WrappedFormUtils
  control: IGlobalControl
  currentOptions: ControlOptions
  parentsInfo?: IParentInfo[]
  onChange: OnFilterControlValueChange
}

export class FilterControl extends PureComponent<IFilterControlProps, {}> {

  public componentWillMount () {
    const { onChange } = this.props
    this.debouncedOnChange = debounce(onChange, 800)
  }

  public componentWillReceiveProps (nextProps: IFilterControlProps) {
    const { onChange } = nextProps
    if (onChange !== this.props.onChange) {
      this.debouncedOnChange = debounce(this.props.onChange, 800)
    }
  }

  private renderControl = (filter) => {
    const { currentOptions } = this.props
    const options = currentOptions || []
    let component
    switch (filter.type) {
      case FilterTypes.InputText:
        component = renderInputText(filter, this.onInputChange)
        break
      case FilterTypes.NumberRange:
        component = renderNumberRange(filter, this.change)
        break
      case FilterTypes.Select:
        component = renderSelect(filter, this.change, options)
        break
      case FilterTypes.TreeSelect:
        component = renderTreeSelect(filter, this.change, options)
        break
      case FilterTypes.Date:
        component = renderDate(filter, this.change)
        break
      case FilterTypes.DateRange:
        component = renderDateRange(filter, this.change)
        break
    }
    return this.wrapFormItem(filter, component)
  }

  private wrapFormItem = (control: IGlobalControl, component: Component): ReactNode => {
    const { getFieldDecorator } = this.props.form
    return (
      <FormItem className={styles.filterControl}>
        {getFieldDecorator(`${control.key}`, {
          initialValue: getDefaultValue(control)
        })(component)}
      </FormItem>
    )
  }

  private change = (val) => {
    const { control, onChange } = this.props
    onChange(control, val)
  }

  private debouncedOnChange = null
  private onInputChange = (e) => {
    const { control } = this.props
    let val = e.target.value
    if (val === '') { val = undefined }
    this.debouncedOnChange(control, val)
  }

  public render () {
    const { control } = this.props
    return (
      <Suspense fallback={null}>
        {this.renderControl(control)}
      </Suspense>
    )
  }
}

export default FilterControl

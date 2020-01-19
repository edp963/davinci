import React, { Component, PureComponent, Suspense, ReactNode } from 'react'
import {
  renderInputText,
  renderNumberRange,
  renderSelect,
  renderDate,
  renderDateRange
} from './'
import { IControlBase, ControlOptions } from './types'
import {
  deserializeDefaultValue
} from './util'
import { FilterTypes } from './filterTypes'
import { Form } from 'antd'
import { WrappedFormUtils } from 'antd/lib/form/Form'
const FormItem = Form.Item

const styles = require('./filter.less')

interface IParentInfo {
  control: IControlBase
  value: any
}

interface IFilterControlProps {
  form: WrappedFormUtils
  control: IControlBase
  currentOptions: ControlOptions
  parentsInfo?: IParentInfo[]
  onChange: (control: IControlBase, value, isInputChange?: boolean) => void
}

export class FilterControl extends PureComponent<IFilterControlProps, {}> {

  private renderControl = (filter) => {
    const { currentOptions } = this.props
    const options = currentOptions || []
    let component
    switch (filter.type) {
      case FilterTypes.InputText:
        component = renderInputText(this.inputChange, this.change)
        break
      case FilterTypes.NumberRange:
        component = renderNumberRange(this.numberRangeChange, this.change)
        break
      case FilterTypes.Select:
        component = renderSelect(filter, this.change, options)
        break
      // case FilterTypes.TreeSelect:
      //   component = renderTreeSelect(filter, this.change, options)
      //   break
      case FilterTypes.Date:
        component = renderDate(filter, this.change)
        break
      case FilterTypes.DateRange:
        component = renderDateRange(filter, this.change)
        break
    }
    return this.wrapFormItem(filter, component)
  }

  private wrapFormItem = (control: IControlBase, component: Component): ReactNode => {
    const { getFieldDecorator } = this.props.form
    return (
      <FormItem label={control.name} className={styles.controlItem}>
        {getFieldDecorator(`${control.key}`, {
          initialValue: deserializeDefaultValue(control)
        })(component)}
      </FormItem>
    )
  }

  private change = (val) => {
    const { control, onChange } = this.props
    onChange(control, val)
  }

  private inputChange = (e) => {
    const { control, onChange } = this.props
    onChange(control, e.target.value, true)
  }

  private numberRangeChange = (val) => {
    const { control, onChange } = this.props
    onChange(control, val, true)
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

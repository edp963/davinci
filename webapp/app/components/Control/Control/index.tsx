/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

import React, { Component, PureComponent, Suspense, ReactNode } from 'react'
import classnames from 'classnames'
import InputText from './InputText'
import NumberRange from 'components/NumberRange'
import Select from './Select'
import Date from './Date'
import DateRange from './DateRange'
import { IControlBase, GlobalControlQueryMode, IControlOption } from '../types'
import { ControlTypes } from '../constants'
import { Form } from 'antd'
const FormItem = Form.Item
import styles from '../Panel/Layouts/Layouts.less'

interface IParentInfo {
  control: IControlBase
  value: any
}

interface IControlProps {
  queryMode: GlobalControlQueryMode
  control: IControlBase
  value: any
  size?: 'default' | 'large' | 'small'
  currentOptions: IControlOption[]
  parentsInfo?: IParentInfo[]
  onChange: (control: IControlBase, value) => void
  onSearch: (changedValues?: object) => void
}

export class Control extends PureComponent<IControlProps, {}> {
  public static defaultProps = {
    size: 'default'
  }

  private renderControl = (control: IControlBase) => {
    const { currentOptions, value, size } = this.props
    const options = currentOptions || []
    let component

    switch (control.type) {
      case ControlTypes.InputText:
        component = (
          <InputText
            value={value}
            size={size}
            onChange={this.inputChange}
            onSearch={this.search}
          />
        )
        break
      case ControlTypes.NumberRange:
        component = (
          <NumberRange
            value={value}
            size={size}
            onChange={this.change}
            onSearch={this.search}
          />
        )
        break
      case ControlTypes.Select:
        component = (
          <Select
            control={control}
            value={value}
            size={size}
            onChange={this.change}
            options={options}
          />
        )
        break
      // case ControlTypes.TreeSelect:
      //   break
      case ControlTypes.Date:
        component = (
          <Date
            control={control}
            value={value}
            size={size}
            onChange={this.change}
          />
        )
        break
      case ControlTypes.DateRange:
        component = (
          <DateRange
            control={control}
            value={value}
            size={size}
            onChange={this.change}
          />
        )
        break
    }
    return this.wrapFormItem(control, component)
  }

  private wrapFormItem = (
    control: IControlBase,
    component: Component
  ): ReactNode => {
    const { size } = this.props
    const itemClassNames = classnames({
      [styles.controlItem]: true,
      [styles.small]: size === 'small'
    })
    return (
      <FormItem label={control.name} className={itemClassNames}>
        {component}
      </FormItem>
    )
  }

  private change = (val) => {
    const { control, onChange } = this.props
    onChange(control, val)
  }

  private inputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { control, onChange } = this.props
    onChange(control, e.target.value.trim())
  }

  private search = (val) => {
    const { queryMode, control, onSearch } = this.props
    if (queryMode === GlobalControlQueryMode.Immediately) {
      onSearch({ [control.key]: val })
    } else {
      onSearch()
    }
  }

  public render() {
    const { control } = this.props
    return <Suspense fallback={null}>{this.renderControl(control)}</Suspense>
  }
}

export default Control

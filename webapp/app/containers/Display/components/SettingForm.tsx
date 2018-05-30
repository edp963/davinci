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

import * as React from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { makeSelectLayerStatus } from '../selectors'

const Form = require('antd/lib/form')
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const InputNumber = require('antd/lib/input-number')
const Radio = require('antd/lib/radio/radio')
const Button = require('antd/lib/button')
const Select = require('antd/lib/select')
const Upload = require('antd/lib/upload')
const Icon = require('antd/lib/icon')
const Popover = require('antd/lib/popover')
const FormItem = Form.Item
const RadioGroup = Radio.Group
const Option = Select.Option

import { SketchPicker } from 'react-color'

const styles = require('../Display.less')

interface ISettingFormProps {
  settingInfo: any,
  form: any,
  screenWidth: number,
  screenHeight: number,
  scale: string,
  gridDistance: number,
  onDisplaySizeChange: (val: number, height: number) => void,
  onDisplayScaleChange: (width: number, val: number) => void,
  onGridDistanceChange: () => void,
  onFormItemChange: (name: any) => any
}

export class SettingForm extends React.PureComponent<ISettingFormProps, {}> {

  private changeWidth = (val) => {
    this.props.onDisplaySizeChange(parseInt(val, 10), this.props.screenHeight)
  }

  private changeHeight = (val) => {
    this.props.onDisplaySizeChange(this.props.screenWidth, parseInt(val, 10))
  }

  private renderSetting = (setting) => {
    const title = <h2 className={styles.formTitle}>{setting.title}</h2>
    const formItems = setting.params.map((param) => this.renderItem(param))
    return (
      <div>{title}{formItems}</div>
    )
  }

  private renderItem = (param) => {
    const { form, onFormItemChange } = this.props
    const { getFieldDecorator } = form

    const title = <h3 className={styles.formBlockTitle}>{param.title}</h3>
    const content = param.items.map((item) => {
      let control
      switch (item.component) {
        case 'inputnumber':
          control = renderInputNumber(item, onFormItemChange)
          break
        case 'colorPicker':
          control = renderColorPicker(item, onFormItemChange)
          break
        case 'select':
          control = renderSelect(item, onFormItemChange)
          break
        case 'radio':
          control = renderRadio(item, onFormItemChange)
          break
        case 'upload':
          control = renderUpload(item, onFormItemChange)
          break
        default:
          control = ''
          break
      }
      if (control) {
        control = wrapFormItem(control, item, getFieldDecorator)
      }
      return control
    })
    return (
      <Row gutter={16} className={styles.formBlock}>
        {title}
        {content}
      </Row>
    )
  }

  public render () {
    const {
      settingInfo,
      form,
      screenWidth,
      screenHeight,
      scale,
      gridDistance,
      onDisplayScaleChange,
      onGridDistanceChange,
      onFormItemChange
    } = this.props
    const { getFieldDecorator } = form

    return this.renderSetting(settingInfo)
  }
}

const mapStateToProps = createStructuredSelector({
  layerStatus: makeSelectLayerStatus()
})

export default Form.create()(SettingForm)

function wrapFormItem (content, item, getFieldDecorator) {
  return (
    <Col key={item.name} span={item.span || 12}>
      <FormItem label={item.title}>
        {getFieldDecorator(item.name, {
          initialValue: item.default || ''
        })(content)}
      </FormItem>
    </Col>
  )
}

function renderSelect (item, onFormItemChange) {
  return (
    <Select
      placeholder={item.tip || item.placeholder || item.name}
      onChange={onFormItemChange(item.name)}
    >
      {
        Array.isArray(item.values)
          ? item.values.map((val) => (
            <Option key={val.value} value={val.value}>{val.name}</Option>
          ))
          : ''
      }
    </Select>
  )
}

function renderInputNumber (item, onFormItemChange) {
  return (
    <InputNumber
      placeholder={item.tip || item.placeholder || item.name}
      min={item.min === undefined ? -Infinity : item.min}
      max={item.max === undefined ? Infinity : item.max}
      onChange={onFormItemChange(item.name)}
    />
  )
}

function renderRadio (item, onFormItemChange) {
  return (
    <RadioGroup onChange={onFormItemChange(item.name)}>
      {
        item.values.map((val) => (
          <Radio key={val.value} value={val.value}>{val.name}</Radio>
        ))
      }
    </RadioGroup>
  )
}

function renderColorPicker (item, onFormItemChange) {
  const colorPicker = (
    <div><SketchPicker onChangeComplete={onFormItemChange(item.name)}/></div>
  )
  return (
    <Popover placement="bottomCenter" trigger="click" content={colorPicker}>
      <Button type="primary" shape="circle">
        <i className="iconfont icon-palette"/>
      </Button>
    </Popover>
  )
}

function renderUpload (item, onFormItemChange) {
  return (
    <Upload
      className={styles.upload}
      name={item.name}
      onChange={onFormItemChange(item.name)}
    >
      <Icon type="plus" />
    </Upload>
  )
}

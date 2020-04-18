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

import React, { useContext } from 'react'
import classnames from 'classnames'
import {
  Input,
  InputNumber,
  Radio,
  Checkbox,
  Select,
  Form,
  Icon,
  Col
} from 'antd'
const RadioGroup = Radio.Group
const CheckboxGroup = Checkbox.Group
const { Option } = Select
const FormItem = Form.Item
import { GetFieldDecoratorOptions } from 'antd/lib/form/Form'

import ColorPicker from 'components/ColorPicker'
import Upload from 'components/Upload'
import IconFont from 'components/IconFont'

import { SettingItem } from './types'
import { SlideSettingContext } from './util'
import api from 'utils/api'

import utilStyles from 'assets/less/util.less'

interface IItemProps {
  item: SettingItem
}

const Item: React.FC<IItemProps> = (props) => {
  const { item } = props
  const { form, size, slideId, layerId } = useContext(SlideSettingContext)
  let visible = true
  const { relatedItems } = item
  if (Array.isArray(relatedItems)) {
    relatedItems.some(({ name, values }) => {
      const relatedValue = form.getFieldValue(name)
      if (values.findIndex((val) => val === relatedValue) < 0) {
        visible = false
        return true
      }
    })
  }
  const itemCls = classnames({
    [utilStyles.hide]: !visible
  })

  const { getFieldDecorator } = form
  const options: GetFieldDecoratorOptions = { initialValue: item.default }

  let control: React.ReactNode
  switch (item.component) {
    case 'input':
      control = <Input size={size} placeholder={item.placeholder} />
      break
    case 'inputnumber':
      control = (
        <InputNumber
          size={size}
          placeholder={item.placeholder}
          min={item.min === undefined ? -Infinity : item.min}
          max={item.max === undefined ? Infinity : item.max}
        />
      )
      break
    case 'radio':
      control = (
        <RadioGroup size={size}>
          {item.values.map(({ value, name }) => (
            <Radio key={value} value={value}>
              {name}
            </Radio>
          ))}
        </RadioGroup>
      )
      break
    case 'checkbox':
      control = <Checkbox />
      options.valuePropName = item.valuePropName
      break
    case 'checkboxGroup':
      control = <CheckboxGroup options={item.values} />
      break
    case 'select':
      control = (
        <Select size={size}>
          {item.values.map(({ name, value }) => (
            <Option key={value} value={value}>
              {name}
            </Option>
          ))}
        </Select>
      )
      break
    case 'colorPicker':
      let color = form.getFieldValue(item.name)
      if (color) {
        color = `rgba(${color.join()})`
      }
      control = (
        <ColorPicker rawValue size={size}>
          <IconFont
            type="icon-palette"
            className="display-setting-form-palette"
            style={{ color }}
          />
        </ColorPicker>
      )
      break
    case 'upload':
      const action = `${api.display}/${item.action}`
        .replace(/({slideId})/, slideId ? `${slideId}` : '')
        .replace(/({layerId})/, layerId ? `${layerId}` : '')
      const img = form.getFieldValue(item.name)
      control = (
        <Upload name={item.name} action={action}>
          {img ? (
            <div className="display-setting-form-img">
              <img src={img} alt={item.title} />
              <Icon
                type="delete"
                onClick={(e) => {
                  e.stopPropagation()
                  form.setFieldsValue({ [item.name]: null })
                }}
              />
            </div>
          ) : (
            <Icon type="plus" />
          )}
        </Upload>
      )
      break
  }
  const { labelCol, wrapperCol, span } = item
  return (
    <Col span={span || 24} className={itemCls}>
      <FormItem
        labelCol={{ span: labelCol || 12 }}
        wrapperCol={{ span: wrapperCol || 12 }}
        label={item.title}
      >
        {getFieldDecorator(item.name, options)(control)}
      </FormItem>
    </Col>
  )
}

export default Item

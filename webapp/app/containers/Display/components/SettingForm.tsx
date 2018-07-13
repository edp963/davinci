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
import { FormComponentProps } from 'antd/lib/form/Form'
import { BASE_URL } from '../../../globalConstants'
import api from 'utils/api'
import { getBase64 } from 'utils/util'

const Form = require('antd/lib/form')
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Input = require('antd/lib/input')
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
  slideId: number,
  settingInfo: any
  settingParams: any
  onFormItemChange: (field: any, value: any) => any
}

interface ISettingFormStates {
  loading: object
}

export class SettingForm extends React.PureComponent<ISettingFormProps & FormComponentProps, ISettingFormStates> {

  constructor (props: ISettingFormProps & FormComponentProps) {
    super(props)
    this.state = {
      loading: {}
    }
  }

  public componentDidMount () {
    const {
      form,
      settingParams
    } = this.props
    form.setFieldsValue({...settingParams})
  }

  public componentWillReceiveProps (nextProps: ISettingFormProps) {
    const {
      form,
      settingParams
    } = this.props
    if (settingParams !== nextProps.settingParams) {
      form.setFieldsValue({...nextProps.settingParams})
    }
  }

  private renderSetting = (setting) => {
    const title = <h2 className={styles.formTitle}>{setting.title}</h2>
    const formItems = setting.params.map((param) => this.renderItem(param))
    return (
      <div>{title}{formItems}</div>
    )
  }

  private formItemChange = (field) => (val) => {
    this.props.onFormItemChange(field, val)
  }

  private renderItem = (param) => {
    const { form, settingParams } = this.props
    const { getFieldDecorator } = form

    const title = <h3 className={styles.formBlockTitle}>{param.title}</h3>
    const content = param.items.map((item) => {
      let control
      switch (item.component) {
        case 'input':
          control = this.renderInput(item, this.formItemChange)
          break
        case 'inputnumber':
          control = this.renderInputNumber(item, this.formItemChange)
          break
        case 'colorPicker':
          control = this.renderColorPicker(item, this.formItemChange, settingParams[item.name])
          break
        case 'select':
          control = this.renderSelect(item, this.formItemChange)
          break
        case 'radio':
          control = this.renderRadio(item, this.formItemChange)
          break
        case 'upload':
          control = this.renderUpload(item, this.formItemChange, settingParams[item.name])
          break
        default:
          control = ''
          break
      }
      if (control) {
        control = this.wrapFormItem(control, item, getFieldDecorator)
      }
      return control
    })
    return (
      <Row gutter={16} className={styles.formBlock} key={param.name}>
        {title}
        {content}
      </Row>
    )
  }

  public render () {
    const {
      settingInfo,
      form
    } = this.props
    const { getFieldDecorator } = form

    return this.renderSetting(settingInfo)
  }

  private wrapFormItem = (control, item, getFieldDecorator) => {
    return (
      <Col key={item.name} span={item.span || 12}>
        <FormItem label={item.title}>
          {getFieldDecorator(item.name, {
            initialValue: item.default || ''
          })(control)}
        </FormItem>
      </Col>
    )
  }

  private renderSelect = (item, formItemChange) => {
    return (
      <Select
        placeholder={item.tip || item.placeholder || item.name}
        onChange={formItemChange(item.name)}
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

  private renderInput = (item, formItemChange) => {
    const onFormInputItemChange = (e) => {
      formItemChange(item.name)(e.target.value)
    }
    return (
      <Input
        placeholder={item.tip || item.placeholder || item.name}
        onChange={onFormInputItemChange}
      />
    )
  }

  private renderInputNumber = (item, formItemChange) => {
    return (
      <InputNumber
        placeholder={item.tip || item.placeholder || item.name}
        min={item.min === undefined ? -Infinity : item.min}
        max={item.max === undefined ? Infinity : item.max}
        onChange={formItemChange(item.name)}
      />
    )
  }

  private renderRadio = (item, formItemChange) => {
    const onFormRadioItemChange = (e) => {
      formItemChange(item.name)(e.target.value)
    }
    return (
      <RadioGroup onChange={onFormRadioItemChange}>
        {
          item.values.map((val) => (
            <Radio key={val.value} value={val.value}>{val.name}</Radio>
          ))
        }
      </RadioGroup>
    )
  }

  private renderColorPicker = (item, formItemChange, rgb) => {
    const onChangeComplete = (e) => {
      const { r, g, b } = e.rgb
      formItemChange(item.name)([r, g, b])
    }

    const color = rgb ? `rgb(${rgb.join()}` : `rgb(0,0,0,1)`
    const colorPicker = (
      <SketchPicker
        color={color}
        disableAlpha={true}
        onChangeComplete={onChangeComplete}
      />
    )
    return (
      <Popover placement="bottom" trigger="click" content={colorPicker}>
        <i className="iconfont icon-palette" style={{color}}/>
      </Popover>
    )
  }

  private renderUpload = (item, formItemChange, img) => {
    const { slideId } = this.props
    const action = `${api.display}/${item.action}`.replace(/({slideId})/, slideId.toString())
    const headers = {
      authorization: `Bearer ${localStorage.getItem('TEMP_TOKEN')}` // FIX ME
    }
    const { loading } = this.state

    const onChange = (info) => {
      const { status, response } = info.file

      if (status === 'uploading') {
        this.setState({
          loading: {
            ...loading,
            [item.name]: true
          }
        })
        return
      }
      if (status === 'done') {
        this.setState({
          loading: {
            ...loading,
            [item.name]: false
          }
        }, () => {
          formItemChange(item.name)(response.payload)
        })
      }
    }

    return (
      <Upload
        className={styles.upload}
        showUploadList={{ showRemoveIcon: true, showPreviewIcon: true }}
        name={item.name}
        disabled={loading[item.name]}
        action={action}
        headers={headers}
        onChange={onChange}
      >
        {img ? (
          <div className={styles.uploadImg}>
            <Icon type="delete"/>
            <img src={img} style={{ maxWidth: '100%', maxHeight: '100%' }} alt={item.title}/>
          </div>
        ) : <Icon type="plus" />}
      </Upload>
    )
  }
}

export default Form.create()(SettingForm)


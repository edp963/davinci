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

import React from 'react'
import debounce from 'lodash/debounce'
import api from 'utils/api'

import { Form, Row, Col, Input, InputNumber, Radio, Checkbox, Select, Upload, Icon, Popover, Tooltip } from 'antd'
const FormItem = Form.Item
const RadioGroup = Radio.Group
const CheckboxGroup = Checkbox.Group
const Option = Select.Option
import { FormComponentProps } from 'antd/lib/form/Form'

import { SketchPicker } from 'react-color'

const styles = require('../Display.less')

interface ISettingFormProps extends FormComponentProps {
  id: number
  settingInfo: any
  settingParams: any
  onDisplaySizeChange: (width: number, height: number) => void
  onFormItemChange: (field: any, value: any) => any
  onCollapseChange: () => void
}

interface ISettingFormStates {
  loading: object
  collapse: boolean
}

export class SettingForm extends React.Component<ISettingFormProps, ISettingFormStates> {

  private debounceFormItemChange = null

  constructor (props: ISettingFormProps) {
    super(props)
    this.state = {
      loading: {},
      collapse: false
    }
    this.debounceFormItemChange = debounce(this.props.onFormItemChange, 1000)
  }

  public shouldComponentUpdate (nextProps: ISettingFormProps, nextState: ISettingFormStates) {
    const { settingInfo, settingParams } = nextProps
    const { collapse } = nextState
    const needUpdate = settingInfo !== this.props.settingInfo
      || !(this.compareSettingParams(this.props.settingParams, settingParams) && this.compareSettingParams(this.props.settingParams, this.props.form.getFieldsValue()))
      || collapse !== this.state.collapse
    return needUpdate
  }

  public componentWillReceiveProps (nextProps: ISettingFormProps) {
    const {
      onFormItemChange,
      settingParams
    } = nextProps
    if (onFormItemChange !== this.props.onFormItemChange) {
      this.debounceFormItemChange = debounce(onFormItemChange, 1000)
    }

    if (!this.compareSettingParams(this.props.settingParams, settingParams)) {
      this.props.form.setFieldsValue({...settingParams})
    }
  }

  private compareSettingParams = (
    params1: ISettingFormProps['settingParams'],
    params2: ISettingFormProps['settingParams']
  ) => {
    const isSame = Object.keys(params1)
      .every((key) => JSON.stringify(params1[key]) === JSON.stringify(params2[key]))
    return isSame
  }

  private getFormItemLayout = (item) => {
    const { labelCol, wrapperCol } = item
    return {
      labelCol: {
        xs: { span: labelCol || 12 }
      },
      wrapperCol: {
        xs: { span: wrapperCol || 12 }
      }
    }
  }

  private toggleCollapse = () => {
    const { onCollapseChange } = this.props
    const { collapse } = this.state
    this.setState({ collapse: !collapse }, () => {
      onCollapseChange()
    })
  }

  private renderSetting = (setting) => {
    const title = (
      <h2 className={styles.formTitle}>
        <span>{setting.title}</span>
        <Tooltip title="显示/隐藏设置">
          <Icon onClick={this.toggleCollapse} type="right-square-o" />
        </Tooltip>
      </h2>
    )
    const formItems = setting.params.map((param) => this.renderItem(param))
    return (
      <div className={styles.right}>
        {title}
        <div className={styles.items}>
          <Form>
            {formItems}
            {this.props.children}
          </Form>
        </div>
      </div>
    )
  }

  private formItemChange = (field) => (val) => {
    this.props.onFormItemChange(field, val)
  }
  private formDebouncedItemChange = (field) => (val) => {
    this.debounceFormItemChange(field, val)
  }
  private formInputItemChange = (field) => (e) => {
    this.props.onFormItemChange(field, e.target.value)
  }
  private formRadioItemChange = (field) => (e) => {
    this.props.onFormItemChange(field, e.target.value)
  }
  private formCheckboxItemChange = (field) => (e) => {
    this.props.onFormItemChange(field, e.target.checked)
  }

  private renderItem = (param) => {
    const { form, settingParams } = this.props
    const { getFieldDecorator } = form

    const title = <h3 className={styles.formBlockTitle}>{param.title}</h3>
    const content = param.items.map((item) => {
      let control
      switch (item.component) {
        case 'input':
          control = this.renderInput(item, this.formInputItemChange)
          break
        case 'inputnumber':
          control = this.renderInputNumber(item, this.formDebouncedItemChange)
          break
        case 'colorPicker':
          control = this.renderColorPicker(item, this.formDebouncedItemChange, settingParams[item.name])
          break
        case 'select':
          control = this.renderSelect(item, this.formItemChange)
          break
        case 'radio':
          control = this.renderRadio(item, this.formRadioItemChange)
          break
        case 'checkbox':
          control = this.renderCheckbox(item, this.formCheckboxItemChange)
          break
        case 'checkboxGroup':
          control = this.renderCheckboxGroup(item, this.formItemChange)
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
      <Row className={styles.formBlock} key={param.name}>
        {title}
        {content}
      </Row>
    )
  }

  public render () {
    const {
      settingInfo
    } = this.props

    const { collapse } = this.state
    if (collapse) {
      return (
        <div className={styles.collapse}>
          <h2 className={styles.formTitle}>
            <Tooltip title="显示/隐藏设置">
              <Icon onClick={this.toggleCollapse} type="left-square-o" />
            </Tooltip>
          </h2>
          <div className={styles.title}>
            <label>{settingInfo.title}</label>
          </div>
        </div>
      )
    }

    return this.renderSetting(settingInfo)
  }

  private wrapFormItem = (control, item, getFieldDecorator) => {
    const { settingParams, id } = this.props
    return (
      <Col key={item.name} span={item.span || 24}>
        <FormItem label={item.title} {...this.getFormItemLayout(item)}>
          {getFieldDecorator(item.name, {
            initialValue: settingParams[item.name] || item.default || ''
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
    return (
      <Input
        placeholder={item.tip || item.placeholder || item.name}
        onPressEnter={formItemChange(item.name)}
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
    return (
      <RadioGroup onChange={formItemChange(item.name)}>
        {
          item.values.map((val) => (
            <Radio key={val.value} value={val.value}>{val.name}</Radio>
          ))
        }
      </RadioGroup>
    )
  }

  private renderCheckbox = (item, formItemChange) => {
    return (
      <Checkbox checked={item.value} onChange={formItemChange(item.name)}>{item.title}</Checkbox>
    )
  }

  private renderCheckboxGroup = (item, formItemChange) => {
    return (
      <CheckboxGroup onChange={formItemChange(item.name)} options={item.values} />
    )
  }

  private renderColorPicker = (item, formItemChange, rgb) => {
    const onChangeComplete = (e) => {
      const { r, g, b, a } = e.rgb
      formItemChange(item.name)([r, g, b, a])
    }

    const color = rgb ? `rgba(${rgb.join()})` : `rgba(0,0,0,1)`
    const colorPicker = (
      <SketchPicker
        color={color}
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
    const { id } = this.props
    const action = `${api.display}/${item.action}`.replace(/({id})/, id.toString())
    const headers = {
      authorization: `Bearer ${localStorage.getItem('TOKEN')}`
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

    const deleteUpload = (e: React.MouseEvent) => {
      formItemChange(item.name)(null)
      e.stopPropagation()
    }

    return (
      <Row>
        <Col span={24}>
          <Upload
            className={styles.upload}
            showUploadList={false}
            name={item.name}
            disabled={loading[item.name]}
            action={action}
            headers={headers}
            onChange={onChange}
          >
            {img ? (
              <div className={styles.img}>
                <img src={img} alt={item.title}/>
                <Icon type="delete" onClick={deleteUpload}/>
              </div>
            ) : <Icon type="plus" />}
          </Upload>
        </Col>
      </Row>
    )
  }
}

export default Form.create<ISettingFormProps>()(SettingForm)


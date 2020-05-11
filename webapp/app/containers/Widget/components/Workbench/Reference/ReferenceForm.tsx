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

import React, {
  PureComponent,
  GetDerivedStateFromProps,
  ChangeEvent
} from 'react'
import { produce } from 'immer'
import classnames from 'classnames'
import {
  Form,
  Row,
  Col,
  Radio,
  Select,
  Checkbox,
  InputNumber,
  message
} from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
import ColorPicker from 'components/ColorPicker'
import {
  ReferenceType,
  ReferenceValueTypeLabels,
  ReferenceValueType,
  ReferenceLabelPositionLabels
} from './constants'
import { IReference, IReferenceLine, IReferenceBand } from './types'
import { IDataParamSource } from '../Dropbox'
import { RadioChangeEvent } from 'antd/lib/radio'
import { decodeMetricName } from '../../util'
import {
  getDefaultReferenceLineData,
  getDefaultReferenceBandData
} from './util'
import {
  PIVOT_CHART_FONT_FAMILIES,
  PIVOT_CHART_FONT_SIZES,
  PIVOT_CHART_LINE_STYLES,
  CHART_LABEL_POSITIONS
} from 'app/globalConstants'
const FormItem = Form.Item
const RadioGroup = Radio.Group
const RadioButton = Radio.Button
const Option = Select.Option
import utilStyles from 'assets/less/util.less'
import styles from './Reference.less'

interface IReferenceFormProps {
  reference: IReference
  metrics: IDataParamSource[]
}

interface IReferenceFormStates {
  prevReference: IReference | null
  editingReference: IReference | null
  formValuesToBeSet: Partial<IReference> | null
}

class ReferenceForm extends PureComponent<
  IReferenceFormProps & FormComponentProps,
  IReferenceFormStates
> {
  public state: IReferenceFormStates = {
    prevReference: null,
    editingReference: null,
    formValuesToBeSet: null
  }

  private referenceValueTypeSelectOptions = Object.entries(
    ReferenceValueTypeLabels
  ).map(([value, label]) => (
    <Option key={value} value={value}>
      {label}
    </Option>
  ))

  private lineLabelPositionOptions = Object.entries(
    ReferenceLabelPositionLabels
  ).map(([value, label]) => (
    <Option key={value} value={value}>
      {label}
    </Option>
  ))
  private bandLabelPositionOptions = CHART_LABEL_POSITIONS.map(
    ({ name, value }) => (
      <Option key={value} value={value}>
        {name}
      </Option>
    )
  )
  private fontFamilyOptions = PIVOT_CHART_FONT_FAMILIES.map(
    ({ name, value }) => (
      <Option key={value} value={value}>
        {name}
      </Option>
    )
  )
  private fontSizeOptions = PIVOT_CHART_FONT_SIZES.map((size) => (
    <Option key={`${size}`} value={`${size}`}>
      {size}
    </Option>
  ))
  private lineStyleOptions = PIVOT_CHART_LINE_STYLES.map(({ name, value }) => (
    <Option key={value} value={value}>
      {name}
    </Option>
  ))

  public static getDerivedStateFromProps: GetDerivedStateFromProps<
    IReferenceFormProps & FormComponentProps,
    IReferenceFormStates
  > = (props, state) => {
    const { reference } = props
    if (reference !== state.prevReference) {
      let editingReference = null
      try {
        editingReference = JSON.parse(JSON.stringify(reference))
      } catch (error) {
        message.error('参考线配置解析失败')
        throw error
      }
      return {
        prevReference: reference,
        editingReference
      }
    }
    return null
  }

  public componentDidMount() {
    const { reference, form } = this.props
    if (reference) {
      const { key, name, ...rest } = reference
      form.setFieldsValue(rest)
    }
  }

  public componentDidUpdate(prevProps) {
    const { reference, form } = this.props
    const { formValuesToBeSet } = this.state
    if (reference !== prevProps.reference) {
      const { key, name, ...rest } = reference
      form.setFieldsValue(rest)
    }
    if (formValuesToBeSet) {
      form.setFieldsValue(formValuesToBeSet)
      this.setState({
        formValuesToBeSet: null
      })
    }
  }

  private formConditionChange = (propPath: string, value) => {
    const propPathArr = propPath.split('.')
    const mergedEditingReference = produce(
      this.state.editingReference,
      (draft) => {
        propPathArr.reduce((changedProp, path, index) => {
          if (index === propPathArr.length - 1) {
            changedProp[path] = value
          }
          return changedProp[path]
        }, draft)
      }
    )

    let extraChangedValues
    switch (propPath) {
      case 'type':
        extraChangedValues =
          value === ReferenceType.Line
            ? getDefaultReferenceLineData()
            : getDefaultReferenceBandData()
        break
    }
    this.setState({
      editingReference: {
        ...mergedEditingReference,
        ...extraChangedValues
      },
      formValuesToBeSet: extraChangedValues
    })
  }

  private change = (name) => {
    return (value) => {
      this.formConditionChange(name, value)
    }
  }

  private inputChange = (name) => {
    return (e: ChangeEvent<HTMLInputElement> | RadioChangeEvent) => {
      this.formConditionChange(name, e.target.value)
    }
  }

  public render() {
    const { form, metrics } = this.props
    const { editingReference } = this.state
    const { getFieldDecorator } = form
    const { type } = editingReference

    const metricSelectOptions = metrics.map((m) => (
      <Option key={m.name} value={m.name}>
        {decodeMetricName(m.name)}
      </Option>
    ))

    let formContent
    if (type === ReferenceType.Line) {
      const { data } = editingReference as IReferenceLine
      formContent = (
        <>
          <Row gutter={8}>
            <Col span={4}>
              <FormItem label="值">
                {getFieldDecorator(
                  'data.type',
                  {}
                )(
                  <Select onChange={this.change('data.type')}>
                    {this.referenceValueTypeSelectOptions}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col
              span={4}
              className={classnames({
                [utilStyles.hide]: data.type !== ReferenceValueType.Constant
              })}
            >
              <FormItem label="常量值" colon={false}>
                {getFieldDecorator('data.value', {
                  rules: [{ required: true, message: '值不能为空' }]
                })(<InputNumber />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="关联指标">
                {getFieldDecorator('data.metric', {
                  rules: [{ required: true, message: '关联指标不能为空' }]
                })(
                  <Select placeholder="请选择指标">
                    {metricSelectOptions}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={4}>
              <FormItem label="标签">
                {getFieldDecorator('data.label.visible', {
                  valuePropName: 'checked'
                })(<Checkbox>显示标签</Checkbox>)}
              </FormItem>
            </Col>
            <Col span={4}>
              <FormItem label="位置">
                {getFieldDecorator(
                  'data.label.position',
                  {}
                )(<Select>{this.lineLabelPositionOptions}</Select>)}
              </FormItem>
            </Col>
            <Col span={4}>
              <FormItem label="字体">
                {getFieldDecorator(
                  'data.label.font.family',
                  {}
                )(<Select>{this.fontFamilyOptions}</Select>)}
              </FormItem>
            </Col>
            <Col span={4}>
              <FormItem label=" " colon={false}>
                {getFieldDecorator(
                  'data.label.font.size',
                  {}
                )(<Select>{this.fontSizeOptions}</Select>)}
              </FormItem>
            </Col>
            <Col span={2}>
              <FormItem label=" " colon={false}>
                {getFieldDecorator(
                  'data.label.font.color',
                  {}
                )(<ColorPicker className={styles.colorPicker} preset />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={4}>
              <FormItem label="线段样式">
                {getFieldDecorator('data.line.width', {})(<InputNumber />)}
              </FormItem>
            </Col>
            <Col span={4}>
              <FormItem label=" " colon={false}>
                {getFieldDecorator(
                  'data.line.type',
                  {}
                )(<Select>{this.lineStyleOptions}</Select>)}
              </FormItem>
            </Col>
            <Col span={2}>
              <FormItem label=" " colon={false}>
                {getFieldDecorator(
                  'data.line.color',
                  {}
                )(<ColorPicker className={styles.colorPicker} preset />)}
              </FormItem>
            </Col>
          </Row>
        </>
      )
    } else if (type === ReferenceType.Band) {
      const { data } = editingReference as IReferenceBand
      formContent = (
        <>
          <Row gutter={8}>
            <Col span={4}>
              <FormItem label="起始值">
                {getFieldDecorator(
                  'data[0].type',
                  {}
                )(
                  <Select onChange={this.change('data.0.type')}>
                    {this.referenceValueTypeSelectOptions}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col
              span={4}
              className={classnames({
                [utilStyles.hide]: data[0].type !== ReferenceValueType.Constant
              })}
            >
              <FormItem label="常量值" colon={false}>
                {getFieldDecorator('data[0].value', {
                  rules: [{ required: true, message: '值不能为空' }]
                })(<InputNumber />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="关联指标">
                {getFieldDecorator('data[0].metric', {
                  rules: [{ required: true, message: '关联指标不能为空' }]
                })(
                  <Select placeholder="请选择指标">
                    {metricSelectOptions}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={4}>
              <FormItem label="结束值">
                {getFieldDecorator(
                  'data[1].type',
                  {}
                )(
                  <Select onChange={this.change('data.1.type')}>
                    {this.referenceValueTypeSelectOptions}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col
              span={4}
              className={classnames({
                [utilStyles.hide]: data[1].type !== ReferenceValueType.Constant
              })}
            >
              <FormItem label="常量值" colon={false}>
                {getFieldDecorator('data[1].value', {
                  rules: [{ required: true, message: '值不能为空' }]
                })(<InputNumber />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="关联指标">
                {getFieldDecorator('data[1].metric', {
                  rules: [{ required: true, message: '关联指标不能为空' }]
                })(
                  <Select placeholder="请选择指标">
                    {metricSelectOptions}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={4}>
              <FormItem label="标签">
                {getFieldDecorator('data[1].label.visible', {
                  valuePropName: 'checked'
                })(<Checkbox>显示标签</Checkbox>)}
              </FormItem>
            </Col>
            <Col span={4}>
              <FormItem label="位置">
                {getFieldDecorator(
                  'data[1].label.position',
                  {}
                )(<Select>{this.bandLabelPositionOptions}</Select>)}
              </FormItem>
            </Col>
            <Col span={4}>
              <FormItem label="字体">
                {getFieldDecorator(
                  'data[1].label.font.family',
                  {}
                )(<Select>{this.fontFamilyOptions}</Select>)}
              </FormItem>
            </Col>
            <Col span={4}>
              <FormItem label=" " colon={false}>
                {getFieldDecorator(
                  'data[1].label.font.size',
                  {}
                )(<Select>{this.fontSizeOptions}</Select>)}
              </FormItem>
            </Col>
            <Col span={2}>
              <FormItem label=" " colon={false}>
                {getFieldDecorator(
                  'data[1].label.font.color',
                  {}
                )(<ColorPicker className={styles.colorPicker} preset />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={3}>
              <FormItem label="区间背景色">
                {getFieldDecorator(
                  'data[1].band.color',
                  {}
                )(<ColorPicker className={styles.colorPicker} preset />)}
              </FormItem>
            </Col>
            <Col span={4}>
              <FormItem label="边框样式">
                {getFieldDecorator(
                  'data[1].band.border.width',
                  {}
                )(<InputNumber />)}
              </FormItem>
            </Col>
            <Col span={4}>
              <FormItem label=" " colon={false}>
                {getFieldDecorator(
                  'data[1].band.border.type',
                  {}
                )(<Select>{this.lineStyleOptions}</Select>)}
              </FormItem>
            </Col>
            <Col span={2}>
              <FormItem label=" " colon={false}>
                {getFieldDecorator(
                  'data[1].band.border.color',
                  {}
                )(<ColorPicker className={styles.colorPicker} preset />)}
              </FormItem>
            </Col>
          </Row>
        </>
      )
    }

    return (
      <Form className={styles.form}>
        <Row gutter={8}>
          <Col span={8}>
            <FormItem label="">
              {getFieldDecorator(
                'type',
                {}
              )(
                <RadioGroup onChange={this.inputChange('type')}>
                  <RadioButton value={ReferenceType.Line}>参考线</RadioButton>
                  <RadioButton value={ReferenceType.Band}>参考区间</RadioButton>
                </RadioGroup>
              )}
            </FormItem>
          </Col>
        </Row>
        {formContent}
      </Form>
    )
  }
}

export default Form.create<IReferenceFormProps & FormComponentProps>()(
  ReferenceForm
)

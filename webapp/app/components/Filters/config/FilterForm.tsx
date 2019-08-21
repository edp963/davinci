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

import React, { Suspense } from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import classnames from 'classnames'

import { Form, Row, Col, Input, InputNumber, Radio, Checkbox, Select, Button, Table } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group
const RadioButton = Radio.Button

import { FilterTypeList, FilterTypesLocale, FilterTypes } from '../filterTypes'
import { renderDate } from '..'
import { InteractionType } from '../types'
import {
  getOperatorOptions,
  getDatePickerFormatOptions
} from '../util'
import DatePickerFormats, {
  DatePickerFormatsLocale,
  DatePickerDefaultValuesLocales,
  DatePickerDefaultValues
} from '../datePickerFormats'
import { setControlFormValues } from 'containers/Dashboard/actions'
import { makeSelectControlForm } from 'containers/Dashboard/selectors'

const utilStyles = require('assets/less/util.less')
const styles = require('../filter.less')

interface IFilterFormProps {
  form: any
  interactionType: InteractionType
  controlFormValues: any
  onControlTypeChange: (value) => void
  onSetControlFormValues: (values) => void
  onOpenOptionModal: () => void
}

export class FilterForm extends React.Component<IFilterFormProps, {}> {

  private renderDefaultValueComponent = () => {
    const { form, controlFormValues } = this.props
    const { getFieldDecorator } = form

    let container
    let type
    let showDefaultValue

    if (controlFormValues) {
      const { type: typeValue, dynamicDefaultValue } = controlFormValues
      type = typeValue
      showDefaultValue = dynamicDefaultValue === DatePickerDefaultValues.Custom
    }

    switch (type) {
      case FilterTypes.Date:
        container = (
          <>
            <Col span={8}>
              <FormItem label="默认值">
                {getFieldDecorator('dynamicDefaultValue', {})(
                  <Select
                    size="small"
                    placeholder="默认值"
                    allowClear
                  >
                    {
                      Object.entries(DatePickerDefaultValuesLocales).map(([value, label]) => (
                        <Option key={value} value={value}>{label}</Option>
                      ))
                    }
                  </Select>
                )}
              </FormItem>
            </Col>
            {
              showDefaultValue && (
                <Suspense fallback={null}>
                  <Col span={8}>
                    <FormItem label=" " colon={false}>
                      {getFieldDecorator('defaultValue', {})(
                        renderDate(controlFormValues, null, {size: 'small'})
                      )}
                    </FormItem>
                  </Col>
                </Suspense>
              )
            }
          </>
        )
        break
    }

    return container
  }

  public render () {
    const { form, interactionType, controlFormValues, onOpenOptionModal } = this.props
    const { getFieldDecorator } = form

    let type
    let operatorOptions
    let datePickerFormatOptions
    let customOptions
    let options
    const filterTypeRelatedInput = []

    if (controlFormValues) {
      const { type: t, multiple, customOptions: co, options: o } = controlFormValues
      type = t
      operatorOptions = getOperatorOptions(type, multiple)
      datePickerFormatOptions = getDatePickerFormatOptions(type, multiple)
      customOptions = co && type === FilterTypes.Select
      options = o

      const dateFormatFormComponent = (
        <Col key="dateFormat" span={8}>
          <FormItem label="日期格式">
            {getFieldDecorator('dateFormat', {})(
              <Select size="small">
                {
                  datePickerFormatOptions.map((format) => {
                    const title = DatePickerFormatsLocale[format]
                    return (
                      <Option key={title} value={format}>{title}</Option>
                    )
                  })
                }
              </Select>
            )}
          </FormItem>
        </Col>
      )

      const multipleFormComponent = (
        <Col key="multiple" span={8}>
          <FormItem label="功能">
            {getFieldDecorator('multiple', {
              valuePropName: 'checked'
            })(
              <Checkbox>多选</Checkbox>
            )}
          </FormItem>
        </Col>
      )

      switch (type) {
        case FilterTypes.Date:
          filterTypeRelatedInput.push(dateFormatFormComponent)
          filterTypeRelatedInput.push(multipleFormComponent)
          break
        case FilterTypes.DateRange:
          filterTypeRelatedInput.push(dateFormatFormComponent)
          break
        case FilterTypes.Select:
          filterTypeRelatedInput.push(multipleFormComponent)
        default:
          break
      }
    }

    const columns = [{
      title: '文本',
      key: 'text',
      dataIndex: 'text'
    }, {
      title: '值',
      key: 'value',
      dataIndex: 'value'
    }]

    return (
      <Form className={styles.filterForm}>
        <div className={styles.title}>
          <h2>控制器配置</h2>
        </div>
        <Row gutter={8} className={styles.formBody}>
          <Col span={8}>
            <FormItem className={utilStyles.hide}>
              {getFieldDecorator('key', {})(<Input />)}
            </FormItem>
            <FormItem label="类型">
              {getFieldDecorator('type', {})(
                <Select size="small">
                  {
                    FilterTypeList.map((filterType) => (
                      <Option key={filterType} value={filterType}>{FilterTypesLocale[filterType]}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          {filterTypeRelatedInput}
        </Row>
        <Row gutter={8} className={styles.formBody}>
          {
            interactionType === 'column'
            && operatorOptions
            && !!operatorOptions.length && (
              <Col span={8}>
                <FormItem label="对应关系">
                  {getFieldDecorator('operator', {})(
                    <Select size="small">
                      {
                        operatorOptions.map((o) => (
                          <Option key={o} value={o}>{o}</Option>
                        ))
                      }
                    </Select>
                  )}
                </FormItem>
              </Col>
            )
          }
          <Col span={8}>
            <FormItem label="宽度">
              {getFieldDecorator('width', {})(
                <Select size="small">
                  <Option value={0}>自动适应</Option>
                  <Option value={24}>100%</Option>
                  <Option value={12}>50%</Option>
                  <Option value={8}>33.33% (1/3)</Option>
                  <Option value={6}>25% (1/4)</Option>
                  <Option value={4}>16.67% (1/6)</Option>
                  <Option value={3}>12.5% (1/8)</Option>
                  <Option value={2}>8.33% (1/12)</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          {
            type === FilterTypes.Select && (
              <>
                <Col key="cache" span={6}>
                  <FormItem label="缓存">
                    {getFieldDecorator('cache', {})(
                      <RadioGroup size="small">
                        <RadioButton value={true}>开启</RadioButton>
                        <RadioButton value={false}>关闭</RadioButton>
                      </RadioGroup>
                    )}
                  </FormItem>
                </Col>
                <Col key="expired" span={8}>
                  <FormItem label="有效期（秒）">
                    {getFieldDecorator('expired', {})(
                      <InputNumber size="small" />
                    )}
                  </FormItem>
                </Col>
              </>
            )
          }
        </Row>
        <Row gutter={8} className={styles.formBody}>
          {this.renderDefaultValueComponent()}
        </Row>
        {
          type === FilterTypes.Select && (
            <Row gutter={8} className={styles.formBody}>
              <Col span={7}>
                <FormItem label="选项">
                  {getFieldDecorator('customOptions', {
                    valuePropName: 'checked'
                  })(
                    <Checkbox>自定义选项</Checkbox>
                  )}
                </FormItem>
              </Col>
              {
                customOptions && (
                  <Col span={2}>
                    <FormItem label=" " colon={false}>
                      <Button
                        size="small"
                        type="primary"
                        icon="plus"
                        shape="circle"
                        onClick={onOpenOptionModal}
                      />
                    </FormItem>
                    <FormItem className={utilStyles.hide}>
                      {getFieldDecorator('options', {})(<Input />)}
                    </FormItem>
                  </Col>
                    )
              }
            </Row>
          )
        }
        {
          customOptions && (
            <Table
              className={styles.optionList}
              size="small"
              dataSource={options}
              columns={columns}
              pagination={false}
              bordered
            />
          )
        }
      </Form>
    )
  }
}

const formOptions = {
  onValuesChange: (props: IFilterFormProps, changedValues) => {
    const { controlFormValues, onControlTypeChange, onSetControlFormValues } = props
    const { operator, dateFormat } = controlFormValues

    if (Object.keys(changedValues).length === 1) {
      if (changedValues.hasOwnProperty('type')
          || changedValues.hasOwnProperty('multiple')) {
        const type = changedValues.type || controlFormValues.type
        const multiple = changedValues.multiple !== void 0 ? changedValues.multiple : controlFormValues.multiple
        const operatorOptions = getOperatorOptions(type, multiple)
        const datePickerFormatOptions = getDatePickerFormatOptions(type, multiple)

        if (!operatorOptions.includes(operator)) {
          changedValues.operator = operatorOptions[0]
        }

        switch (type) {
          case FilterTypes.Date:
          case FilterTypes.DateRange:
            if (!datePickerFormatOptions.includes(dateFormat)) {
              changedValues.dateFormat = DatePickerFormats.Date
            }
            break
        }
      }

      if (changedValues.hasOwnProperty('multiple')) {
        changedValues.defaultValue = null
      }

      if (changedValues.hasOwnProperty('type')) {
        onControlTypeChange(changedValues.type)
      }
    }

    onSetControlFormValues({
      ...controlFormValues,
      ...changedValues
    })
  },
  mapPropsToFields (props: IFilterFormProps) {
    return props.controlFormValues
      ? Object.entries(props.controlFormValues)
          .reduce((result, [key, value]) => {
            result[key] = Form.createFormField({ value })
            return result
          }, {})
      : null
  }
}

const mapStateToProps = createStructuredSelector({
  controlFormValues: makeSelectControlForm()
})

export function mapDispatchToProps (dispatch) {
  return {
    onSetControlFormValues: (values) => dispatch(setControlFormValues(values))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create<FormComponentProps & IFilterFormProps>(formOptions)(FilterForm))

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

import { Form, Row, Col, Input, Checkbox, Select, Radio } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
const FormItem = Form.Item
const Option = Select.Option

import { OperatorTypes } from 'utils/operatorTypes'
import { FilterTypeList, FilterTypesLocale, FilterTypesOperatorSetting, FilterTypes } from '../filterTypes'
import {
  renderDate,
  getOperatorOptions,
  getDatePickerFormatOptions
} from '..'
import DatePickerFormats, {
  DatePickerFormatsLocale,
  DatePickerDefaultValuesLocales,
  DatePickerDefaultValues
} from '../datePickerFormats'
import { setControlFormValues } from '../../../containers/Dashboard/actions'
import { makeSelectControlForm } from '../../../containers/Dashboard/selectors'

const utilStyles = require('../../../assets/less/util.less')
const styles = require('../filter.less')

interface IFilterFormProps {
  form: any
  controlFormValues: any
  onControlTypeChange: (value) => void
  onSetControlFormValues: (values) => void
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
            <Col span={8} className={classnames({[utilStyles.hide]: !showDefaultValue})}>
              <FormItem label=" " colon={false}>
                {getFieldDecorator('defaultValue', {})(
                  <Suspense fallback={null}>
                    {renderDate(controlFormValues, () => void 0, {size: 'small'})}
                  </Suspense>
                )}
              </FormItem>
            </Col>
          </>
        )
        break
    }

    return container
  }

  public render () {
    const { form, controlFormValues } = this.props
    // const {
    //   modelItems
    // } = this.state
    const { getFieldDecorator } = form

    let type
    let operatorOptions
    let datePickerFormatOptions
    const filterTypeRelatedInput = []

    if (controlFormValues) {
      const { type: typeValue, multiple } = controlFormValues
      type = typeValue
      operatorOptions = getOperatorOptions(typeValue, multiple)
      datePickerFormatOptions = getDatePickerFormatOptions(typeValue, multiple)

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

      switch (typeValue) {
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

    return (
      <Form className={styles.filterForm}>
        <div className={styles.title}>
          <h2>筛选控件配置</h2>
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
            type === FilterTypes.TreeSelect ? (
              <>
                <Col span={8}>
                  <FormItem label="值字段">
                    {getFieldDecorator('valueColumn', {
                      rules: [{
                        required: true,
                        message: '不能为空'
                      }]
                    })(
                      <Select size="small" dropdownMatchSelectWidth={false}>
                        {/* {
                          modelItems.map((item) => (
                            <Option key={item.name} value={item.name}>{item.name}</Option>
                          ))
                        } */}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="文本字段">
                    {getFieldDecorator('textColumn', {
                      rules: [{
                        required: true,
                        message: '不能为空'
                      }]
                    })(
                      <Select size="small" dropdownMatchSelectWidth={false}>
                        {/* {
                          modelItems.map((item) => (
                            <Option key={item.name} value={item.name}>{item.name}</Option>
                          ))
                        } */}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="父级字段">
                    {getFieldDecorator('parentColumn', {
                      rules: [{
                        required: true,
                        message: '不能为空'
                      }]
                    })(
                      <Select size="small" dropdownMatchSelectWidth={false}>
                        {/* {
                          modelItems.map((item) => (
                            <Option key={item.name} value={item.name}>{item.name}</Option>
                          ))
                        } */}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </>
            ) : null
          }
        </Row>
        <Row gutter={8} className={styles.formBody}>
          {
            operatorOptions && !!operatorOptions.length && (
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
        </Row>
        <Row gutter={8} className={styles.formBody}>
          {this.renderDefaultValueComponent()}
        </Row>
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

      if (changedValues.hasOwnProperty('valueColumn')) {
        changedValues.textColumn = changedValues.valueColumn
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

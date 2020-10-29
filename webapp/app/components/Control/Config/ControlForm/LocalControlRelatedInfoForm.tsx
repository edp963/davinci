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

import React, { FC, useCallback, useMemo, memo } from 'react'
import { Form, Row, Col, Radio, Select, Divider } from 'antd'
import { WrappedFormUtils } from 'antd/lib/form/Form'
import { RadioChangeEvent } from 'antd/lib/radio'
import { IFlatRelatedView } from './types'
import { ControlFieldTypes, ControlTypes, IS_RANGE_TYPE } from '../../constants'
import { filterSelectOption } from 'app/utils/util'
import { IViewModelProps } from 'app/containers/View/types'
const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group
const RadioButton = Radio.Button

interface ILocalControlRelatedInfoFormProps {
  form: WrappedFormUtils
  relatedView: IFlatRelatedView
  controlType: ControlTypes
  optionWithVariable: boolean
  onFieldTypeChange: (id: number) => (e: RadioChangeEvent) => void
}

const LocalControlRelatedInfoForm: FC<ILocalControlRelatedInfoFormProps> = ({
  form,
  relatedView,
  controlType,
  optionWithVariable,
  onFieldTypeChange
}) => {
  const { getFieldDecorator } = form
  const { id, fieldType, models, variables } = relatedView
  const isMultiple =
    IS_RANGE_TYPE[controlType] && fieldType === ControlFieldTypes.Variable
  const fieldValues = form.getFieldValue(`relatedViews[${id}].fields`) || []
  const colSpan = { xxl: 12, xl: 18 }
  const itemCols = {
    labelCol: { span: 8 },
    wrapperCol: { span: 12 }
  }

  const columnValidator = useCallback(
    (rule, value, callback) => {
      if (
        (Array.isArray(value) && !!value.length) ||
        (!Array.isArray(value) && value !== void 0)
      ) {
        const selectedModel =
          fieldType === ControlFieldTypes.Column
            ? models.find((m) => m.name === value)
            : Array.isArray(value)
            ? value.every((v) => variables.find((vr) => vr.name === v))
            : variables.find((vr) => vr.name === value)
        if (!selectedModel) {
          callback('数据模型已变化，请重新选择')
        } else {
          callback()
        }
      } else {
        callback()
      }
    },
    [form, fieldType, models, variables]
  )

  const fieldTypeText = useMemo(
    () => (fieldType === ControlFieldTypes.Column ? '字段' : '变量'),
    [fieldType]
  )

  return (
    <>
      <Divider orientation="left">关联设置</Divider>
      <Row>
        <Col {...colSpan}>
          <FormItem label="关联类型" {...itemCols}>
            {getFieldDecorator(
              `relatedViews[${id}].fieldType`,
              {}
            )(
              <RadioGroup
                size="small"
                disabled={optionWithVariable}
                onChange={onFieldTypeChange(id)}
              >
                <RadioButton value={ControlFieldTypes.Column}>字段</RadioButton>
                <RadioButton value={ControlFieldTypes.Variable}>
                  变量
                </RadioButton>
              </RadioGroup>
            )}
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col {...colSpan}>
          <FormItem label={`关联${fieldTypeText}`} {...itemCols}>
            {getFieldDecorator(`relatedViews[${id}].fields`, {
              rules: [
                {
                  required: true,
                  message: `关联${fieldTypeText}不能为空`
                },
                { validator: columnValidator }
              ]
            })(
              <Select
                showSearch
                placeholder="请选择"
                filterOption={filterSelectOption}
                {...(isMultiple && { mode: 'multiple' })}
                disabled={optionWithVariable}
              >
                {fieldType === ControlFieldTypes.Column
                  ? models.map((m: IViewModelProps) => (
                      <Option key={m.name} value={m.name}>
                        {m.name}
                      </Option>
                    ))
                  : variables.map((v) => (
                      <Option
                        key={v.name}
                        value={v.name}
                        disabled={
                          isMultiple &&
                          fieldValues.length === 2 &&
                          !fieldValues.includes(v.name)
                        }
                      >
                        {v.name}
                      </Option>
                    ))}
              </Select>
            )}
          </FormItem>
        </Col>
      </Row>
    </>
  )
}

export default memo(LocalControlRelatedInfoForm)

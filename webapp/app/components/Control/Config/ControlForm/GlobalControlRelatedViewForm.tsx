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

import React, { FC, memo, useCallback } from 'react'
import classnames from 'classnames'
import { Form, Row, Col, Select, Radio, Empty } from 'antd'
import { WrappedFormUtils } from 'antd/lib/form/Form'
import { RadioChangeEvent } from 'antd/lib/radio'
import { IViewModelProps } from 'app/containers/View/types'
import { ControlFieldTypes, ControlTypes, IS_RANGE_TYPE } from '../../constants'
import { IFlatRelatedView } from './types'
import { filterSelectOption } from 'app/utils/util'
import styles from '../../Control.less'
const FormItem = Form.Item
const Option = Select.Option
const RadioButton = Radio.Button
const RadioGroup = Radio.Group

interface IGlobalControlRelatedViewFormProps {
  form: WrappedFormUtils
  relatedViews: IFlatRelatedView[]
  controlType: ControlTypes
  optionWithVariable: boolean
  onFieldTypeChange: (id: number) => (e: RadioChangeEvent) => void
}

const GlobalControlRelatedViewForm: FC<IGlobalControlRelatedViewFormProps> = ({
  form,
  relatedViews,
  controlType,
  optionWithVariable,
  onFieldTypeChange
}) => {
  const { getFieldDecorator } = form

  const viewsClass = classnames({
    [styles.views]: true,
    [styles.empty]: !relatedViews.length
  })

  const columnValidator = useCallback(
    (rule, value, callback) => {
      if (
        (Array.isArray(value) && !!value.length) ||
        (!Array.isArray(value) && value !== void 0)
      ) {
        const { field } = rule
        const viewId = field.substring(
          field.indexOf('[') + 1,
          field.indexOf(']')
        )
        const { fieldType, models, variables } = relatedViews.find(
          (v) => v.id === Number(viewId)
        )
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
    [form, relatedViews]
  )

  return (
    <div className={styles.viewContainer}>
      <div className={styles.title}>
        <h2>关联数据视图</h2>
      </div>
      <div className={viewsClass}>
        {relatedViews.length ? (
          relatedViews.map(({ id, name, fieldType, models, variables }) => {
            const isMultiple =
              IS_RANGE_TYPE[controlType] &&
              fieldType === ControlFieldTypes.Variable
            const fieldValues =
              form.getFieldValue(`relatedViews[${id}].fields`) || []
            return (
              <div key={id} className={styles.relatedView}>
                <div className={styles.name}>
                  <h4>{name}</h4>
                  {getFieldDecorator(
                    `relatedViews[${id}].fieldType`,
                    {}
                  )(
                    <RadioGroup
                      size="small"
                      className={styles.fieldType}
                      disabled={optionWithVariable}
                      onChange={onFieldTypeChange(id)}
                    >
                      <RadioButton value={ControlFieldTypes.Column}>
                        字段
                      </RadioButton>
                      <RadioButton value={ControlFieldTypes.Variable}>
                        变量
                      </RadioButton>
                    </RadioGroup>
                  )}
                </div>
                <Row gutter={8}>
                  <Col span={24}>
                    <FormItem>
                      {getFieldDecorator(`relatedViews[${id}].fields`, {
                        rules: [
                          {
                            required: true,
                            message: `关联${
                              fieldType === ControlFieldTypes.Column
                                ? '字段'
                                : '变量'
                            }不能为空`
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
              </div>
            )
          })
        ) : (
          <Empty key="empty" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>
    </div>
  )
}

export default memo(GlobalControlRelatedViewForm)

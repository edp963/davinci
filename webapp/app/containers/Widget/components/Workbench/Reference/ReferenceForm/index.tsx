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
import LineForm from './LineForm'
import BandForm from './BandForm'
import { Form, Row, Col, Radio, message } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
import { ReferenceType } from '../constants'
import { IReference, IReferenceLineData, IReferenceBandData } from '../types'
import { IDataParamSource } from '../../Dropbox'
import { RadioChangeEvent } from 'antd/lib/radio'
import {
  getDefaultReferenceLineData,
  getDefaultReferenceBandData
} from '../util'
const FormItem = Form.Item
const RadioGroup = Radio.Group
const RadioButton = Radio.Button
import styles from '../Reference.less'

interface IReferenceFormProps {
  reference: IReference
  metrics: IDataParamSource[]
}

interface IReferenceFormStates {
  prevReference: IReference
  editingReference: IReference
  formValuesToBeSet: Partial<IReference>
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

  private renderFormContent(type: ReferenceType) {
    const { form, metrics } = this.props
    const { editingReference } = this.state
    const { data } = editingReference
    switch (type) {
      case ReferenceType.Line:
        return (
          <LineForm
            form={form}
            data={data as IReferenceLineData}
            metrics={metrics}
            onDataTypeChange={this.change}
          />
        )
      case ReferenceType.Band:
        return (
          <BandForm
            form={form}
            data={data as IReferenceBandData}
            metrics={metrics}
            onDataTypeChange={this.change}
          />
        )
    }
  }

  public render() {
    const { form } = this.props
    const { editingReference } = this.state
    const { getFieldDecorator } = form
    const { type } = editingReference

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
        {this.renderFormContent(type)}
      </Form>
    )
  }
}

export default Form.create<IReferenceFormProps & FormComponentProps>()(
  ReferenceForm
)

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

import React, { FC, memo, useMemo } from 'react'
import classnames from 'classnames'
import { Form, Row, Col, Select, Checkbox, InputNumber } from 'antd'
import { WrappedFormUtils } from 'antd/lib/form/Form'
import ColorPicker from 'components/ColorPicker'
import { ReferenceValueType } from '../constants'
import { IReferenceBandData } from '../types'
import {
  referenceValueTypeSelectOptions,
  bandLabelPositionOptions,
  fontFamilyOptions,
  fontSizeOptions,
  lineStyleOptions
} from './Options'
import { IDataParamSource } from '../../Dropbox'
import { decodeMetricName } from '../../../util'
import utilStyles from 'assets/less/util.less'
import styles from '../Reference.less'
const FormItem = Form.Item
const Option = Select.Option

interface IBandFormProps {
  form: WrappedFormUtils
  data: IReferenceBandData
  metrics: IDataParamSource[]
  onDataTypeChange: (name: string) => (value: string) => void
}

const BandForm: FC<IBandFormProps> = ({
  form,
  data,
  metrics,
  onDataTypeChange
}) => {
  const { getFieldDecorator } = form

  const metricSelectOptions = useMemo(
    () =>
      metrics.map((m) => (
        <Option key={m.name} value={m.name}>
          {decodeMetricName(m.name)}
        </Option>
      )),
    [metrics]
  )

  return (
    <>
      <Row gutter={8}>
        <Col span={4}>
          <FormItem label="起始值">
            {getFieldDecorator(
              'data[0].type',
              {}
            )(
              <Select onChange={onDataTypeChange('data.0.type')}>
                {referenceValueTypeSelectOptions}
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
            })(<Select placeholder="请选择指标">{metricSelectOptions}</Select>)}
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
              <Select onChange={onDataTypeChange('data.1.type')}>
                {referenceValueTypeSelectOptions}
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
            })(<Select placeholder="请选择指标">{metricSelectOptions}</Select>)}
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
            )(<Select>{bandLabelPositionOptions}</Select>)}
          </FormItem>
        </Col>
        <Col span={4}>
          <FormItem label="字体">
            {getFieldDecorator(
              'data[1].label.font.family',
              {}
            )(<Select>{fontFamilyOptions}</Select>)}
          </FormItem>
        </Col>
        <Col span={4}>
          <FormItem label=" " colon={false}>
            {getFieldDecorator(
              'data[1].label.font.size',
              {}
            )(<Select>{fontSizeOptions}</Select>)}
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
            )(<Select>{lineStyleOptions}</Select>)}
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

export default memo(BandForm)

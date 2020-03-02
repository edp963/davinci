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
  useEffect,
  useState,
  useCallback,
  useMemo,
  useImperativeHandle,
  forwardRef
} from 'react'
import moment, { Moment } from 'moment'
import { Form, Row, Col, Input, Select, DatePicker, Spin } from 'antd'
const FormItem = Form.Item
const { TextArea } = Input
const { Option } = Select
const { RangePicker } = DatePicker

import { FormComponentProps } from 'antd/lib/form'
import {
  SchedulePeriodUnit,
  ISchedule,
  ICronExpressionPartition
} from '../types'
import { FormItemStyle, LongFormItemStyle } from '../constants'

import Styles from './ScheduleBaseConfig.less'

const periodUnitList: SchedulePeriodUnit[] = [
  'Minute',
  'Hour',
  'Day',
  'Week',
  'Month',
  'Year'
]

const periodUnitListLocale: { [key in SchedulePeriodUnit]: string } = {
  Minute: '分钟',
  Hour: '小时',
  Day: '天',
  Week: '周',
  Month: '月',
  Year: '年'
}

const minutePeriodOptions = [...Array(50).keys()].map((s) => (
  <Option key={s + 10} value={s + 10}>
    {s + 10}
  </Option>
))

const minuteOptions = [...Array(60).keys()].map((m) => (
  <Option key={m} value={m}>
    {`0${m}`.slice(-2)} 分
  </Option>
))

const hourOptions = [...Array(24).keys()].map((h) => (
  <Option key={h} value={h}>
    {`0${h}`.slice(-2)} 时
  </Option>
))

const dayOptions = [...Array(31).keys()].map((d) => (
  <Option key={d + 1} value={d + 1}>
    {`0${d + 1}`.slice(-2)} 日
  </Option>
))

const weekOptions = [
  '星期天',
  '星期一',
  '星期二',
  '星期三',
  '星期四',
  '星期五',
  '星期六'
].map((w, idx) => (
  <Option key={idx + 1} value={idx + 1}>
    {w}
  </Option>
))

const monthOptions = [...Array(12).keys()].map((m) => (
  <Option key={m + 1} value={m + 1}>
    {`0${m + 1}`.slice(-2)}月
  </Option>
))

export type ScheduleBaseFormProps = ISchedule &
  ICronExpressionPartition & {
    dateRange: [Moment, Moment]
  }

interface IScheduleBaseConfigProps
  extends FormComponentProps<ScheduleBaseFormProps> {
  schedule: ISchedule
  loading: boolean
  onCheckUniqueName: (
    data: any,
    resolve: () => any,
    reject: (error: string) => any
  ) => any
}

const computePeriodUnit = (cronExpression: string) => {
  const partitions = cronExpression.split(' ')
  const stars = partitions.filter((item) => item === '*').length
  let periodUnit: SchedulePeriodUnit = 'Minute'
  switch (stars) {
    case 3:
      periodUnit = partitions[1].includes('/') ? 'Minute' : 'Hour'
      break
    case 2:
      periodUnit = 'Day'
      break
    case 1:
      periodUnit = partitions[partitions.length - 1] === '?' ? 'Month' : 'Week'
      break
    case 0:
      periodUnit = 'Year'
      break
  }
  return periodUnit
}

export const ScheduleBaseConfig: React.FC<IScheduleBaseConfigProps> = (
  props,
  ref
) => {
  const { form, schedule, loading, onCheckUniqueName } = props

  const checkNameUnique = useCallback(
    (_, name = '', callback) => {
      const { id, projectId } = schedule
      const data = { id, name, projectId }
      if (!name) {
        callback()
      }
      onCheckUniqueName(
        data,
        () => {
          callback()
        },
        (err) => callback(err)
      )
    },
    [onCheckUniqueName, schedule]
  )

  const { cronExpression } = schedule
  const [currentPeriodUnit, setCurrentPeriodUnit] = useState<
    SchedulePeriodUnit
  >(computePeriodUnit(cronExpression))

  useEffect(
    () => {
      const periodUnit = computePeriodUnit(cronExpression)
      setCurrentPeriodUnit(periodUnit)
    },
    [cronExpression]
  )

  let { minute, hour, day, month, weekDay } = useMemo<
    Partial<ScheduleBaseFormProps>
  >(
    () => {
      const partitions = cronExpression.split(' ')
      let minute =
        form.getFieldValue('minute') ||
        +(partitions[1].includes('/')
          ? partitions[1].slice(2) // slice(2) to remove */
          : partitions[1])
      // min minute duration is 10
      if (currentPeriodUnit === 'Minute' && minute < 10) {
        minute = 10
        form.setFieldsValue({ minute })
      }
      const hour = +partitions[2] || 0
      const day = +partitions[3] || 1
      const month = +partitions[4] || 1
      const weekDay = +partitions[5] || 1
      return { minute, hour, day, month, weekDay }
    },
    [cronExpression, currentPeriodUnit]
  )

  const { getFieldDecorator } = form
  const { startDate, endDate } = schedule

  useImperativeHandle(ref, () => ({ form }))

  return (
    <Form>
      <Row>
        <Col span={12}>
          <FormItem label="名称" {...FormItemStyle} hasFeedback>
            {getFieldDecorator<ScheduleBaseFormProps>('name', {
              rules: [
                { required: true, message: '名称不能为空' },
                { validator: checkNameUnique }
              ],
              initialValue: schedule.name
            })(<Input autoComplete="new-name" />)}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem label="类型" {...FormItemStyle}>
            {getFieldDecorator<ScheduleBaseFormProps>('jobType', {
              initialValue: schedule.jobType
            })(
              <Select>
                <Option value="email">Email</Option>
              </Select>
            )}
          </FormItem>
        </Col>
      </Row>
      <FormItem label="描述" {...LongFormItemStyle}>
        {getFieldDecorator<ScheduleBaseFormProps>('description', {
          initialValue: schedule.description
        })(<TextArea />)}
      </FormItem>
      <FormItem label="有效时间范围" {...LongFormItemStyle}>
        {getFieldDecorator<ScheduleBaseFormProps>('dateRange', {
          initialValue: [
            startDate && moment(startDate),
            endDate && moment(endDate)
          ]
        })(
          <RangePicker
            style={{ width: '100%' }}
            showTime
            format="YYYY-MM-DD HH:mm:ss"
          />
        )}
      </FormItem>
      <FormItem label="执行时间设置" {...LongFormItemStyle}>
        {loading ? (
          <Spin />
        ) : (
          <Row className={Styles.cronSetting} gutter={8}>
            <span>每</span>
            {/* Minute */}
            {currentPeriodUnit === 'Minute' && (
              <>
                {getFieldDecorator<ScheduleBaseFormProps>('minute', {
                  initialValue: minute
                })(
                  <Select style={{ width: 80 }}>{minutePeriodOptions}</Select>
                )}
              </>
            )}
            {/** */}
            {getFieldDecorator<ScheduleBaseFormProps>('periodUnit', {
              initialValue: currentPeriodUnit
            })(
              <Select
                style={{ width: 80 }}
                onChange={(value: SchedulePeriodUnit) =>
                  setCurrentPeriodUnit(value)
                }
              >
                {periodUnitList.map((unit) => (
                  <Option key={unit} value={unit}>
                    {periodUnitListLocale[unit]}
                  </Option>
                ))}
              </Select>
            )}

            {/* Hour */}
            {currentPeriodUnit === 'Hour' && (
              <>
                <span>的第</span>
                {getFieldDecorator<ScheduleBaseFormProps>('minute', {
                  initialValue: minute
                })(<Select style={{ width: 80 }}>{minuteOptions}</Select>)}
              </>
            )}
            {/* Day */}
            {currentPeriodUnit === 'Day' && (
              <>
                <span>的</span>
                {getFieldDecorator<ScheduleBaseFormProps>('hour', {
                  initialValue: hour
                })(<Select style={{ width: 80 }}>{hourOptions}</Select>)}
                <span>:</span>
                {getFieldDecorator<ScheduleBaseFormProps>('minute', {
                  initialValue: minute
                })(<Select style={{ width: 100 }}>{minuteOptions}</Select>)}
              </>
            )}
            {/* Week */}
            {currentPeriodUnit === 'Week' && (
              <>
                {getFieldDecorator<ScheduleBaseFormProps>('weekDay', {
                  initialValue: weekDay
                })(<Select style={{ width: 95 }}>{weekOptions}</Select>)}
                <span>的</span>
                {getFieldDecorator<ScheduleBaseFormProps>('hour', {
                  initialValue: hour
                })(<Select style={{ width: 80 }}>{hourOptions}</Select>)}
                <span>:</span>
                {getFieldDecorator<ScheduleBaseFormProps>('minute', {
                  initialValue: minute
                })(<Select style={{ width: 80 }}>{minuteOptions}</Select>)}
              </>
            )}
            {/* Month */}
            {currentPeriodUnit === 'Month' && (
              <>
                {getFieldDecorator<ScheduleBaseFormProps>('day', {
                  initialValue: day
                })(<Select style={{ width: 80 }}>{dayOptions}</Select>)}
                <span>的</span>
                {getFieldDecorator<ScheduleBaseFormProps>('hour', {
                  initialValue: hour
                })(<Select style={{ width: 80 }}>{hourOptions}</Select>)}
                <span>:</span>
                {getFieldDecorator('minute', { initialValue: minute })(
                  <Select style={{ width: 80 }}>{minuteOptions}</Select>
                )}
              </>
            )}
            {/* Year */}
            {currentPeriodUnit === 'Year' && (
              <>
                {getFieldDecorator<ScheduleBaseFormProps>('month', {
                  initialValue: month
                })(<Select style={{ width: 80 }}>{monthOptions}</Select>)}
                {getFieldDecorator<ScheduleBaseFormProps>('day', {
                  initialValue: day
                })(<Select style={{ width: 80 }}>{dayOptions}</Select>)}
                <span>的</span>
                {getFieldDecorator<ScheduleBaseFormProps>('hour', {
                  initialValue: hour
                })(<Select style={{ width: 80 }}>{hourOptions}</Select>)}
                <span>:</span>
                {getFieldDecorator<ScheduleBaseFormProps>('minute', {
                  initialValue: minute
                })(<Select style={{ width: 80 }}>{minuteOptions}</Select>)}
              </>
            )}
          </Row>
        )}
      </FormItem>
    </Form>
  )
}

export default Form.create<IScheduleBaseConfigProps>()(
  forwardRef(ScheduleBaseConfig)
)

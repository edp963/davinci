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

import React, { FC, useCallback } from 'react'
import { IControlBase } from '../types'
import { DatePicker } from 'antd'
const { RangePicker } = DatePicker
import { DatePickerFormats } from '../constants'

interface IDateRangeProps {
  control: IControlBase
  value: any
  size: 'large' | 'small' | 'default'
  onChange: (value) => void
}

const DateRange: FC<IDateRangeProps> = ({ control, value, size, onChange }) => {
  const { dateFormat } = control
  const placeholder: [string, string] = ['从', '到']
  const { Datetime, DatetimeMinute } = DatePickerFormats
  const isDatetimePicker = [Datetime, DatetimeMinute].includes(dateFormat)

  return (
    <RangePicker
      placeholder={placeholder}
      value={value}
      size={size}
      showTime={isDatetimePicker}
      format={dateFormat}
      onChange={onChange}
      onOk={onChange}
    />
  )
}

export default DateRange

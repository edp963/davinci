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

import React, { FC, useMemo, useState, useCallback } from 'react'
import noop from 'lodash/noop'
import { Select, InputNumber, Input } from 'antd'
import { IRelativeDate } from './type'
import {
  RelativeDateType,
  RelativeDateTypeLabels,
  RelativeDateValueType,
  RelativeDateValueTypeLables
} from './constants'
const Option = Select.Option
const InputGroup = Input.Group

interface IRelativeDatePickerProps {
  value?: IRelativeDate
  onChange?: (value: IRelativeDate) => void
}

const IRelativeDatePicker: FC<IRelativeDatePickerProps> = ({
  value: valueProp,
  onChange
}) => {
  const [type, setType] = useState(valueProp.type)
  const [valueType, setValueType] = useState(valueProp.valueType)
  const [localValue, setLocalValue] = useState(valueProp.value)

  const changeType = useCallback((value) => {
    setType(value)
    onChange({
      ...valueProp,
      type: value
    })
  }, [])

  const changeValueType = useCallback((value) => {
    setValueType(value)
    onChange({
      ...valueProp,
      valueType: value
    })
  }, [])

  const changeValue = useCallback((value) => {
    setLocalValue(value)
    onChange({
      ...valueProp,
      value
    })
  }, [])

  const relativeDateTypeOptions = useMemo(
    () =>
      Object.entries(RelativeDateTypeLabels).map(([value, label]) => (
        <Option key={value} value={value}>
          {label}
        </Option>
      )),
    []
  )

  const relativeDateValueTypeOptions = useMemo(
    () =>
      Object.entries(RelativeDateValueTypeLables).map(([value, label]) => (
        <Option key={value} value={value}>
          {value === RelativeDateValueType.Current ? label[type] : label}
        </Option>
      )),
    [type]
  )

  const selectStyle = {
    width: valueType !== RelativeDateValueType.Current ? '33%' : '50%'
  }

  return (
    <InputGroup compact>
      <Select
        dropdownMatchSelectWidth={false}
        value={valueType}
        onChange={changeValueType}
        style={selectStyle}
      >
        {relativeDateValueTypeOptions}
      </Select>
      {valueType !== RelativeDateValueType.Current && (
        <InputNumber
          min={1}
          precision={0}
          value={localValue}
          onChange={changeValue}
          style={{ width: '34%' }}
        />
      )}
      <Select
        dropdownMatchSelectWidth={false}
        value={type}
        onChange={changeType}
        style={selectStyle}
      >
        {relativeDateTypeOptions}
      </Select>
    </InputGroup>
  )
}

IRelativeDatePicker.defaultProps = {
  value: {
    type: RelativeDateType.Day,
    valueType: RelativeDateValueType.Current,
    value: 1
  },
  onChange: noop
}

export default IRelativeDatePicker

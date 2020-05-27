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

import React, { FC } from 'react'
import { Select as AntSelect } from 'antd'
import { IControlBase, IControlOption } from '../types'
import { SelectValue } from 'antd/lib/select'
const Option = AntSelect.Option

declare const SelectSizes: ['default', 'large', 'small']

interface ISelectProps {
  control: IControlBase
  value: SelectValue
  size: typeof SelectSizes[number]
  onChange: (
    value: SelectValue,
    option: React.ReactElement<any> | Array<React.ReactElement<any>>
  ) => void
  options: IControlOption[]
}

const Select: FC<ISelectProps> = ({
  control,
  value,
  size,
  onChange,
  options
}) => {
  const { multiple } = control
  return (
    <AntSelect
      showSearch
      allowClear
      placeholder="请选择"
      value={value}
      size={size}
      onChange={onChange}
      dropdownMatchSelectWidth={false}
      {...(multiple && { mode: 'multiple' })}
    >
      {options.map((o) => (
        <Option key={o.value} value={o.value}>
          {o.text}
        </Option>
      ))}
    </AntSelect>
  )
}

export default Select

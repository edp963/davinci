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

import React, { FC, forwardRef } from 'react'
import { Radio as AntRadio } from 'antd'
import { IControl, IControlOption } from '../types'
import { RadioChangeEvent } from 'antd/lib/radio'
const RadioGroup = AntRadio.Group
const RadioButton = AntRadio.Button

declare const RaduoSizes: ['default', 'large', 'small']

interface IRadioProps {
  control: Omit<IControl, 'relatedItems' | 'relatedViews'>
  value?: any
  size?: typeof RaduoSizes[number]
  onChange?: (e: RadioChangeEvent) => void
  options: IControlOption[]
}

const Radio: FC<IRadioProps> = (
  { control, value, size, onChange, options },
  ref
) => {
  const RadioOption = control.radioType === 'button' ? RadioButton : AntRadio
  return (
    <RadioGroup
      value={value}
      buttonStyle="solid"
      onChange={onChange}
      {...(size && { size })}
      ref={ref}
    >
      {options.map((o) => (
        <RadioOption key={o.value} value={o.value}>
          {o.text}
        </RadioOption>
      ))}
    </RadioGroup>
  )
}

export default forwardRef(Radio)

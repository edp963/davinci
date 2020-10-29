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

import React, { FC, forwardRef, ChangeEventHandler } from 'react'
import { Input } from 'antd'
import { InputSizes } from 'antd/lib/input/Input'
const Search = Input.Search

interface IInputTextProps {
  value?: string
  size?: typeof InputSizes[number]
  onChange?: ChangeEventHandler<HTMLInputElement>
  onSearch?: (
    value: string,
    event?:
      | React.ChangeEvent<HTMLInputElement>
      | React.MouseEvent<HTMLElement>
      | React.KeyboardEvent<HTMLInputElement>
  ) => void
}

const InputText: FC<IInputTextProps> = (
  { value, size, onChange, onSearch },
  ref
) => {
  return (
    <Search
      placeholder="请输入"
      value={value}
      {...(size && { size })}
      onChange={onChange}
      {...(onSearch && { onSearch })}
      ref={ref}
    />
  )
}

export default forwardRef(InputText)

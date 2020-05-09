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

import React, { useContext } from 'react'

import { Select } from 'antd'
const { Option } = Select
import { OptionProps } from 'antd/lib/select'

import { EditorContext } from '../context'
import { HeadingElementTypes } from '../Element/constants'

const Heading: React.FC = () => {
  const { isElementActive, toggleElement } = useContext(EditorContext)

  const activeValue =
    HeadingSelectOptions.find(({ value }) => isElementActive(value))?.value ||
    HeadingElementTypes.HeadingNone

  return (
    <Select
      value={activeValue}
      dropdownMatchSelectWidth={false}
      className="richtext-toolbar-select"
      style={{ width: 90 }}
      size="small"
      onChange={toggleElement}
    >
      {HeadingSelectOptions.map(({ value, label }) => (
        <Option key={value} value={value}>
          {label}
        </Option>
      ))}
    </Select>
  )
}

export default Heading

interface HeadingOptionProps extends OptionProps {
  value: HeadingElementTypes
}

const HeadingSelectOptions: HeadingOptionProps[] = [
  {
    value: HeadingElementTypes.HeadingOne,
    label: <h1>一级标题</h1>
  },
  {
    value: HeadingElementTypes.HeadingTwo,
    label: <h2>二级标题</h2>
  },
  {
    value: HeadingElementTypes.HeadingThree,
    label: <h3>三级标题</h3>
  },
  {
    value: HeadingElementTypes.HeadingFour,
    label: <h4>四级标题</h4>
  },
  {
    value: HeadingElementTypes.HeadingFive,
    label: <h5>五级标题</h5>
  },
  {
    value: HeadingElementTypes.HeadingSix,
    label: <h6>六级标题</h6>
  },
  {
    value: HeadingElementTypes.HeadingNone,
    label: <span>无标题</span>
  }
]

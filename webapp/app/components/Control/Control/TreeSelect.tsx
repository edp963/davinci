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
import { TreeSelect as AntTreeSelect } from 'antd'
import { TreeNode } from 'antd/lib/tree-select'
import { IControl } from '../types'
import { CONTROL_MAX_TAG_COUNT } from '../constants'
import { filterTreeSelectOption } from 'app/utils/util'

declare const SelectSizes: ['default', 'large', 'small']

interface ITreeSelectProps {
  control: Omit<IControl, 'relatedItems' | 'relatedViews'>
  value?: string | string[]
  size?: typeof SelectSizes[number]
  onChange?: (value: string | string[]) => void
  options: TreeNode[]
}

const TreeSelect: FC<ITreeSelectProps> = (
  { control, value, size, onChange, options },
  ref
) => {
  const { multiple } = control

  return (
    <AntTreeSelect
      showSearch
      allowClear
      treeCheckable={multiple}
      treeDataSimpleMode
      placeholder="请选择"
      maxTagCount={CONTROL_MAX_TAG_COUNT}
      treeData={options}
      value={value}
      onChange={onChange}
      {...(size && { size })}
      filterTreeNode={filterTreeSelectOption}
      ref={ref}
    />
  )
}

export default forwardRef(TreeSelect)

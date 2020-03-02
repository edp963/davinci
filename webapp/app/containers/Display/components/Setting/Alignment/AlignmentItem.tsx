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

import React, { useCallback } from 'react'
import { Tooltip } from 'antd'
import IconFont from 'components/IconFont'

import { LayerAlignmentTypes } from './constants'
import { LayerAlignmentItemConfig } from './types'

interface IAlignmentItemProps extends LayerAlignmentItemConfig {
  onClick: (alignmentType: LayerAlignmentTypes) => void
}

const AlignmentItem: React.FC<IAlignmentItemProps> = (props) => {
  const { type, title, icon, onClick } = props

  const setAlignment = useCallback(() => {
    onClick(type)
  }, [type, onClick])

  return (
    <Tooltip placement="bottom" title={title}>
      <IconFont onClick={setAlignment} type={icon} />
    </Tooltip>
  )
}

export default AlignmentItem

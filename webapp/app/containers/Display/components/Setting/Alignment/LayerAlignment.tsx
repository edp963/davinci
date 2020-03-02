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
import { Card } from 'antd'
import AlignmentItem from './AlignmentItem'

import { LayerAlignmentTypes } from './constants'

import { AlignmentGroups } from './constants'

import './Alignment.less'

interface ILayerAlignmentProps {
  onChange: (alignmentType: LayerAlignmentTypes) => void
}

const LayerAlignment: React.FC<ILayerAlignmentProps> = (props) => {
  const { onChange } = props

  const setAlignment = useCallback(
    (alignmentType: LayerAlignmentTypes) => {
      onChange(alignmentType)
    },
    [onChange]
  )

  return (
    <Card className="display-layer-align" title="图层对齐" size="small">
      {AlignmentGroups.map((group, idx) => (
        <div key={idx} className="display-layer-align-category">
          {group.map((props) => (
            <AlignmentItem key={props.type} {...props} onClick={setAlignment} />
          ))}
        </div>
      ))}
    </Card>
  )
}

export default LayerAlignment

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

import React from 'react'
import { Card } from 'antd'

import CommandList from './CommandList'
import { LayerRadioGroup, LayerRadio } from './LayerRadio'
import { LayerOperations } from '../../constants'
import { LayerBase } from '../../types'
import { LayerSelectionInfo } from './types'

interface ILayerListProps {
  layers: LayerBase[]
  selection: LayerSelectionInfo
  onCommand: (operation: LayerOperations) => void
  onSelectionChange: (
    layerId: number,
    checked: boolean,
    exclusive: boolean
  ) => void
}

const LayerList: React.FC<ILayerListProps> = (props) => {
  const { layers, selection, onCommand, onSelectionChange } = props

  return (
    <Card
      className="display-layer-list"
      size="small"
      title={
        <CommandList className="display-layer-command" onCommand={onCommand} />
      }
    >
      <LayerRadioGroup>
        {layers.map((layer) => (
          <LayerRadio
            key={layer.id}
            id={layer.id}
            checked={selection[layer.id].selected}
            onChange={onSelectionChange}
          >
            {layer.name}
          </LayerRadio>
        ))}
      </LayerRadioGroup>
    </Card>
  )
}

export default React.memo(LayerList)

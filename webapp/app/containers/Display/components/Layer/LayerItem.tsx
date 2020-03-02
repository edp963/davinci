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

import { LayerDraggable } from './Draggable'
import { LayerResizable } from './Resizable'
import LayerBox from './Content/LayerBox'
// @TODO add contextmenu to Layer
// import LayerContextMenu from './ContextMenu/LayerContextMenu'
import LayerTool from './Content/LayerTool'
import LayerTooltip from './Content/LayerTooltip'
import LayerCore from './LayerCore'

const LayerItem: React.FC = () => (
  // <LayerContextMenu>
  <LayerDraggable>
    <LayerResizable>
      <LayerBox>
        <LayerTool />
        <LayerTooltip>
          <LayerCore />
        </LayerTooltip>
      </LayerBox>
    </LayerResizable>
  </LayerDraggable>
  // </LayerContextMenu>
)

export default LayerItem

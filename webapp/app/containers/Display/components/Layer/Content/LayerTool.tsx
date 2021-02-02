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

import React, { useContext, useCallback, MouseEvent } from 'react'

import { Tooltip, Icon } from 'antd'

import { LayerContext, LayerListContext } from '../util'

const LayerTool: React.FC = () => {
  const { editWidget } = useContext(LayerListContext)
  const {
    layer: { widgetId }
  } = useContext(LayerContext)
  if (!widgetId) {
    return null
  }
  const edit = useCallback(() => {
    editWidget(widgetId)
  }, [editWidget, widgetId])

  const stopPPG = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
  }, [])

  return (
    <div className="display-slide-layer-tools" onMouseDown={stopPPG}>
      <Tooltip title="编辑">
        <Icon type="edit" onClick={edit} />
      </Tooltip>
    </div>
  )
}

export default LayerTool

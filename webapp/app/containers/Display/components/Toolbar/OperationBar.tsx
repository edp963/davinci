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

import React, { useContext, useCallback } from 'react'

import { Button, Icon } from 'antd'
const ButtonGroup = Button.Group

import { DisplayToolbarContext } from './util'
import { LayerOperations } from '../constants'

interface IOperationBarProps {
  onOperate: (operation: LayerOperations) => void
}

const OperationBar: React.FC<IOperationBarProps> = (props) => {
  const { onOperate } = props
  const { size, comment } = useContext(DisplayToolbarContext)

  const copyLayers = useCallback(() => {
    onOperate(LayerOperations.Copy)
  }, [onOperate])

  const pasteLayers = useCallback(() => {
    onOperate(LayerOperations.Paste)
  }, [onOperate])

  return (
    <>
      <ButtonGroup size={size}>
        <Button type="ghost" onClick={copyLayers}>
          <Icon type="copy" />
          {comment && '复制'}
        </Button>
        <Button type="ghost" onClick={pasteLayers}>
          <Icon type="snippets" />
          {comment && '粘贴'}
        </Button>
      </ButtonGroup>
      {/* @TODO layers undo/redo */}
      {/* <ButtonGroup size={size}>
        <Button type="ghost">
          <Icon type="undo" />
          {comment && '撤销'}
        </Button>
        <Button type="ghost">
          <Icon type="redo" />
          {comment && '恢复'}
        </Button>
      </ButtonGroup> */}
    </>
  )
}
export default OperationBar

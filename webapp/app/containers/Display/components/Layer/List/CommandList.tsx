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
import classnames from 'classnames'

import { Button, Tooltip } from 'antd'
const ButtonGroup = Button.Group
import IconFont from 'components/IconFont'

import { LayerOperations, LayerCommands } from '../../constants'

interface ILayerCommandProps {
  operation: LayerOperations
  icon: string
  title: string
  onClick: (operation: LayerOperations) => void
}

const LayerCommand: React.FC<ILayerCommandProps> = (props) => {
  const { operation, icon, title, onClick } = props

  const click = useCallback(() => {
    onClick(operation)
  }, [operation, onClick])

  return (
    <Tooltip placement="bottom" title={title}>
      <Button type="ghost" onClick={click}>
        <IconFont type={icon} />
      </Button>
    </Tooltip>
  )
}

interface ILayerCommandListProps {
  className?: string
  onCommand: (operation: LayerOperations) => void
}

const LayerCommandList: React.FC<ILayerCommandListProps> = (props) => {
  const { onCommand, className } = props
  const cls = classnames({ [className]: !!className })
  return (
    <ButtonGroup className={cls} size="small">
      {LayerCommands.map((cmd) => (
        <LayerCommand key={cmd.operation} {...cmd} onClick={onCommand} />
      ))}
    </ButtonGroup>
  )
}

export default React.memo(LayerCommandList)

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

import React, { useContext, useCallback, useMemo } from 'react'

import { Button, Icon, Dropdown, Menu } from 'antd'
const ButtonGroup = Button.Group
import IconFont from 'components/IconFont'

import { DisplayToolbarContext } from './util'
import { GraphTypes, SecondaryGraphTypes } from '../constants'
import { ClickParam } from 'antd/lib/menu'

const SecondaryGraphIcons = [
  {
    name: '矩形',
    icon: 'icon-rounded-rect',
    type: SecondaryGraphTypes.Rectangle
  },
  {
    name: '标签',
    icon: 'icon-rect-text',
    type: SecondaryGraphTypes.Label
  },
  {
    name: '视频',
    icon: 'icon-video',
    type: SecondaryGraphTypes.Video
  },
  {
    name: '时间器',
    icon: 'icon-clock',
    type: SecondaryGraphTypes.Timer
  }
]

interface IChartProps {
  onAdd: (type: GraphTypes, subType?: SecondaryGraphTypes) => void
}

const Chart: React.FC<IChartProps> = (props) => {
  const { size, comment } = useContext(DisplayToolbarContext)
  const { onAdd } = props

  const addChart = useCallback(() => {
    onAdd(GraphTypes.Chart)
  }, [onAdd])

  const addSecondary = useCallback(
    (param: ClickParam) => {
      onAdd(GraphTypes.Secondary, +param.key as SecondaryGraphTypes)
    },
    [onAdd]
  )

  const overlay = (
    <Menu onClick={addSecondary}>
      {SecondaryGraphIcons.map(({ name, icon, type }) => (
        <Menu.Item key={type}>
          <IconFont type={icon} />{name}
        </Menu.Item>
      ))}
    </Menu>
  )

  return (
    <ButtonGroup size={size}>
      <Button type="ghost" onClick={addChart}>
        <Icon type="bar-chart" />
        {comment && '图表'}
      </Button>
      <Dropdown overlay={overlay} placement="bottomRight" trigger={['click']}>
        <Button type="ghost">
          <Icon type="appstore" />
          {comment && '辅助图形'}
        </Button>
      </Dropdown>
    </ButtonGroup>
  )
}
export default Chart

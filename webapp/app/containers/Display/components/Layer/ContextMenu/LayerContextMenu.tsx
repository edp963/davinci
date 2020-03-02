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
import { Menu, Dropdown, Icon } from 'antd'
const { Item: MenuItem } = Menu
import IconFont from 'components/IconFont'

import { LayerCommands } from 'containers/Display/components/constants'
import { ContextMenuProxy } from './ContextMenuProxy'

const menu = (
  <Menu>
    <MenuItem key="copy">
      <Icon type="copy" /> 复制
    </MenuItem>
    <MenuItem key="delete">
      <Icon type="delete" /> 删除
    </MenuItem>
    {LayerCommands.map(({ title, icon, operation }) => (
      <MenuItem key={operation}>
        <IconFont type={icon} />
        {title}
      </MenuItem>
    ))}
  </Menu>
)

const LayerContextMenu: React.FC = (props) => {
  return (
    <Dropdown overlay={menu} trigger={['contextMenu']}>
      <ContextMenuProxy>{props.children}</ContextMenuProxy>
    </Dropdown>
  )
}

export default LayerContextMenu

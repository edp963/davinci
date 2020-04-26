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

import React, { memo, useRef, useMemo, useCallback } from 'react'
import classnames from 'classnames'
import { Menu } from 'antd'
import styles from './FullScreenPanel.less'

interface IMenuTitle {
  id: number
  name: string
}

interface IFullScreenMenuProps {
  itemId: number
  visible: boolean
  titles: IMenuTitle[]
  onChange: (itemId: number) => any
}

const FullScreenMenu: React.FC<IFullScreenMenuProps> = memo(
  ({ itemId, visible, titles, onChange }) => {
    const sideMenuClass = classnames({
      [styles.sideMenu]: true,
      [styles.hide]: !visible,
      [styles.show]: visible
    })

    const onMenuClick = useCallback(
      (e) => {
        onChange(Number(e.key))
      },
      [onChange]
    )

    const menus = useMemo(() => {
      return (
        <Menu
          theme="light"
          onClick={onMenuClick}
          selectedKeys={[itemId.toString()]}
        >
          {titles.map((t) => (
            <Menu.Item key={t.id}>
              <i style={{ marginRight: '8px' }} />
              {t.name}
            </Menu.Item>
          ))}
        </Menu>
      )
    }, [itemId, titles])

    return <div className={sideMenuClass}>{menus}</div>
  }
)

export default FullScreenMenu

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

import React, { memo, useState, useMemo, useCallback } from 'react'
import classnames from 'classnames'
import FullScreenMenu from './Menu'
import FullScreenChart from './Chart'
import FullScreenControl from './Control'
import { Icon } from 'antd'
import {
  IDashboard,
  IDashboardItemInfo,
  ILoadData,
  IDashboardItem
} from '../../containers/Dashboard/types'
import { IWidgetFormed } from 'app/containers/Widget/types'
import { IFormedViews, IShareFormedViews } from 'app/containers/View/types'
import { OnGetControlOptions } from 'app/components/Control/types'
import { ControlPanelTypes } from 'app/components/Control/constants'
import { IShareDashboardItemInfo } from 'share/containers/Dashboard/types'
import styles from './FullScreenPanel.less'

interface IFullScreenPanelProps {
  itemId: number
  currentDashboard: IDashboard
  widgets: IWidgetFormed[]
  formedViews: IFormedViews | IShareFormedViews
  currentItems: IDashboardItem[]
  currentItemsInfo: {
    [itemId: string]: IDashboardItemInfo | IShareDashboardItemInfo
  }
  onLoadData: ILoadData
  onGetOptions: OnGetControlOptions
  onSearch: (
    type: ControlPanelTypes,
    relatedItems: number[],
    formValues?: object,
    itemId?: number
  ) => void
  onSetFullScreenPanelItemId: (itemId: number) => void
  onMonitoredSearchDataAction?: () => void
}

const FullScreenPanel: React.FC<IFullScreenPanelProps> = memo(
  ({
    itemId,
    currentDashboard,
    widgets,
    formedViews,
    currentItems,
    currentItemsInfo,
    onLoadData,
    onGetOptions,
    onSearch,
    onSetFullScreenPanelItemId,
    onMonitoredSearchDataAction
  }) => {
    const [menuVisible, setMenuVisible] = useState(false)
    const [controlVisible, setControlVisible] = useState(false)

    const menus = useMemo(
      () =>
        currentItems.map((item) => {
          const widget = widgets.find((w) => w.id === item.widgetId)
          return {
            id: item.id,
            name: widget.name
          }
        }),
      [currentItems, widgets]
    )

    const item = useMemo(() => currentItems.find((c) => c.id === itemId), [
      itemId,
      currentItems
    ])
    const widget = useMemo(() => widgets.find((w) => w.id === item.widgetId), [
      item,
      widgets
    ])
    const formedView = useMemo(() => formedViews[widget.viewId], [
      widget,
      formedViews
    ])
    const info = currentItemsInfo[itemId]

    const onSetMenuVisible = useCallback(() => {
      setMenuVisible(!menuVisible)
    }, [menuVisible])

    const onSetControlVisible = useCallback(() => {
      setControlVisible(!controlVisible)
    }, [controlVisible])

    const onClose = useCallback(() => {
      onSetFullScreenPanelItemId(null)
    }, [onSetFullScreenPanelItemId])

    const hasGlobalControls = useMemo(() => {
      return currentDashboard ? !!currentDashboard.config.filters.length : false
    }, [currentDashboard])
    const hasLocalControls = useMemo(() => !!widget.config.controls.length, [
      widget
    ])
    const hasNoControls = !hasGlobalControls && !hasLocalControls

    const fsClassName = classnames({
      [styles.fullScreen]: true,
      [styles.displayNone]: !itemId,
      [styles.displayBlock]: !!itemId
    })

    const controlClass = classnames({
      [styles.displayNone]: hasNoControls
    })

    return (
      <div className={fsClassName}>
        <div className={styles.container}>
          <nav className={styles.header}>
            <div className={styles.logo}>
              <Icon
                type={menuVisible ? 'menu-fold' : 'menu-unfold'}
                onClick={onSetMenuVisible}
                style={{ marginRight: '32px' }}
              />
              <span>{widget.name}</span>
            </div>
            <ul className={styles.tools}>
              <li onClick={onSetControlVisible} className={controlClass}>
                <Icon type="filter" />
                <span>控制器</span>
              </li>
              <li onClick={onClose}>
                <Icon type="fullscreen-exit" />
                <span>退出全屏</span>
              </li>
            </ul>
          </nav>
          <div className={styles.body}>
            <FullScreenMenu
              itemId={itemId}
              visible={menuVisible}
              titles={menus}
              onChange={onSetFullScreenPanelItemId}
            />
            <FullScreenChart
              itemId={itemId}
              widget={widget}
              info={info}
              model={formedView.model}
              onLoadData={onLoadData}
            />
            {!hasNoControls && (
              <FullScreenControl
                visible={controlVisible}
                itemId={itemId}
                widget={widget}
                hasGlobalControls={hasGlobalControls}
                hasLocalControls={hasLocalControls}
                currentDashboard={currentDashboard}
                currentItems={currentItems}
                formedViews={formedViews}
                onGetOptions={onGetOptions}
                onSearch={onSearch}
                onMonitoredSearchDataAction={onMonitoredSearchDataAction}
              />
            )}
          </div>
        </div>
      </div>
    )
  }
)

export default FullScreenPanel

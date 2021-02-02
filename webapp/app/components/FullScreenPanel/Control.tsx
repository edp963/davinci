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

import React, { memo, useState, useCallback, useEffect } from 'react'
import classnames from 'classnames'
import GlobalControlPanel from 'containers/ControlPanel/Global'
import LocalControlPanel from 'containers/ControlPanel/Local'
import { IDashboardItem, IDashboard } from '../../containers/Dashboard/types'
import { IWidgetFormed } from 'app/containers/Widget/types'
import {
  ControlPanelLayoutTypes,
  ControlPanelTypes
} from 'app/components/Control/constants'
import { OnGetControlOptions } from 'app/components/Control/types'
import { IFormedViews, IShareFormedViews } from 'app/containers/View/types'
import styles from './FullScreenPanel.less'

interface IControlProps {
  visible: boolean
  itemId: number
  widget: IWidgetFormed
  hasGlobalControls: boolean
  hasLocalControls: boolean
  currentDashboard: IDashboard
  currentItems: IDashboardItem[]
  formedViews: IFormedViews | IShareFormedViews
  onGetOptions: OnGetControlOptions
  onSearch: (
    type: ControlPanelTypes,
    relatedItems: number[],
    formValues?: object,
    itemId?: number
  ) => void
  onMonitoredSearchDataAction?: () => void
}

const FullScreenControl: React.FC<IControlProps> = memo(
  ({
    visible,
    itemId,
    widget,
    hasGlobalControls,
    hasLocalControls,
    currentDashboard,
    currentItems,
    formedViews,
    onGetOptions,
    onSearch,
    onMonitoredSearchDataAction
  }) => {
    const [type, setType] = useState('global')

    const checkCtrlStyle = useCallback(
      (type: 'local' | 'global') => () => {
        setType(type)
      },
      [type]
    )

    useEffect(() => {
      if (hasLocalControls && !hasGlobalControls) {
        setType('local')
      }
    }, [hasGlobalControls, hasLocalControls])

    const controlClass = classnames({
      [styles.controlPanel]: true,
      [styles.controlHide]: !visible,
      [styles.controlShow]: visible
    })

    const ctrlGlobalStyle = classnames({
      [styles.ctrl]: true,
      [styles.displayNone]: !hasGlobalControls,
      [styles.unSelectControlTitleStyle]: type === 'local',
      [styles.selectControlTitleStyle]: type === 'global'
    })

    const ctrlLocalStyle = classnames({
      [styles.ctrl]: true,
      [styles.displayNone]: !hasLocalControls,
      [styles.unSelectControlTitleStyle]: type === 'global',
      [styles.selectControlTitleStyle]: type === 'local'
    })

    return (
      <div className={controlClass}>
        <div className={styles.controlHeader}>
          <div className={styles.headerTitle}>
            <div className={ctrlGlobalStyle} onClick={checkCtrlStyle('global')}>
              全局控制器
            </div>
            <div className={ctrlLocalStyle} onClick={checkCtrlStyle('local')}>
              组件控制器
            </div>
          </div>
        </div>
        <div className={styles.controlBody}>
          {type === 'global' ? (
            <GlobalControlPanel
              currentDashboard={currentDashboard}
              currentItems={currentItems}
              formedViews={formedViews}
              layoutType={ControlPanelLayoutTypes.Fullscreen}
              onGetOptions={onGetOptions}
              onSearch={onSearch}
              onMonitoredSearchDataAction={onMonitoredSearchDataAction}
            />
          ) : (
            <LocalControlPanel
              formedViews={formedViews}
              itemId={itemId}
              widget={widget}
              layoutType={ControlPanelLayoutTypes.Fullscreen}
              onGetOptions={onGetOptions}
              onSearch={onSearch}
              onMonitoredSearchDataAction={onMonitoredSearchDataAction}
            />
          )}
        </div>
      </div>
    )
  }
)

export default FullScreenControl

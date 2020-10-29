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

import React, { useMemo } from 'react'
import { Menu, Icon } from 'antd'
import { getPivot } from 'containers/Widget/components/util'
import { DrillType, WidgetDimension, IDataDrillProps } from './types'
import { getListsByViewModelTypes } from 'containers/View/util'
import { ViewModelTypes } from 'containers/View/constants'
const styles = require('./datadrill.less')


const DataDrill: React.FC<IDataDrillProps> = (props: IDataDrillProps) => {
  const {
    onDataDrillUp,
    onDataDrillDown,
    onDataDrillPath,
    currentData,
    drillHistory,
    widgetConfig,
    drillpathSetting
  } = props

  let renderComponent = void 0

  let menuDisabled = void 0

  const getCategoriesModels = useMemo(() => {
    return getListsByViewModelTypes(
      widgetConfig && widgetConfig.model,
      'modelType'
    )(ViewModelTypes.Category)
  }, [widgetConfig])

  const widgetMode = useMemo(() => {
    return widgetConfig && widgetConfig.mode
  }, [widgetConfig])

  const currentCategories = useMemo(() => {
    return currentData && currentData[0] ? Object.keys(currentData[0]) : []
  }, [currentData])

  const drillHistoryGroups = useMemo(() => {
    if (drillHistory && drillHistory.length) {
      return drillHistory[drillHistory.length - 1]['groups']
    }
  }, [drillHistory])

  const getDrilledGroup = useMemo(() => {
    return drillHistory && drillHistory.length
      ? drillHistory.map((history) => history.currentGroup)
      : []
  }, [drillHistory])

  const modelsfilterDrilledGroup = useMemo(() => {
    return getCategoriesModels.filter((cate) => !getDrilledGroup.includes(cate))
  }, [drillHistory, widgetConfig, getCategoriesModels, getDrilledGroup])

  const { drilldownCategories, drillupCategories } = useMemo(() => {
    return {
      drillupCategories: modelsfilterDrilledGroup
        .filter((cate) => currentCategories.includes(cate))
        .map((c) => ({
          name: c,
          modelType: ViewModelTypes.Category,
          drillType: DrillType.UP
        })),
      drilldownCategories: modelsfilterDrilledGroup
        .filter((cate) => !currentCategories.includes(cate))
        .map((c) => ({
          name: c,
          modelType: ViewModelTypes.Category,
          drillType: DrillType.DOWN
        }))
    }
  }, [widgetConfig, currentData, currentCategories])

  const drillOtherCategories = useMemo(() => {
    return drillHistoryGroups && drillHistoryGroups.length
      ? modelsfilterDrilledGroup
          .filter((cate) => !drillHistory.some((his) => his.currentGroup === cate))
          .map((name) => ({
            name,
            modelType: ViewModelTypes.Category,
            drillType: drillHistoryGroups.includes(name)
              ? DrillType.UP
              : DrillType.DOWN
          }))
      : drilldownCategories
  }, [drillHistory])

  const isPivot = useMemo(() => widgetMode === 'pivot', [widgetMode])

  const isPivotTableVal = useMemo(() => isPivotTable(widgetConfig.metrics), [
    widgetConfig
  ])

  if (drillpathSetting && drillpathSetting.length) {
    if (drillHistory && drillHistory.length) {
      menuDisabled = drillHistory.length === drillpathSetting.length - 1
    }
    renderComponent = (
      <Menu onClick={drillpath} style={{ width: 120 }} mode="vertical">
        <Menu.Item key="drillpath" disabled={menuDisabled}>
          <span
            style={{ fontSize: '14px' }}
            className="iconfont icon-iconxiazuan"
          >
            <span style={{ marginLeft: '8px' }}>下钻</span>
          </span>
        </Menu.Item>
      </Menu>
    )
  } else {
    renderComponent = (
      <Menu onClick={drill} style={{ width: 120 }} mode="vertical">
        {isPivot ? (
          <Menu.SubMenu
            key={`${DrillType.UP}`}
            disabled={drillupCategories.length < 2}
            title={
              <span
                style={{ fontSize: '14px' }}
                className="iconfont icon-iconxiazuan1"
              >
                <span style={{ marginLeft: '8px' }}>上卷</span>
              </span>
            }
          >
            {drillupCategories
              ? drillupCategories.map((col) => (
                  <Menu.Item key={col.name}>{col.name}</Menu.Item>
                ))
              : ''}
          </Menu.SubMenu>
        ) : (
          <Menu.SubMenu
            key="drillAll"
            disabled={drillOtherCategories.length < 1}
            title={
              <span
                style={{ fontSize: '14px' }}
                className="iconfont icon-iconxiazuan"
              >
                <span style={{ marginLeft: '8px' }}>钻取</span>
              </span>
            }
          >
            {drillOtherCategories
              ? drillOtherCategories.map((col) => (
                  <Menu.Item key={`${col.name}|${col.drillType}`}>
                    <span className={styles.items}>
                      <span>{col.name}</span>
                      <span>
                        <Icon
                          type={`${
                            col.drillType === DrillType.UP
                              ? 'arrow-up'
                              : 'arrow-down'
                          }`}
                        />
                      </span>
                    </span>
                  </Menu.Item>
                ))
              : ''}
          </Menu.SubMenu>
        )}
        {isPivot ? (
          <Menu.SubMenu
            key={`${DrillType.DOWN}`}
            disabled={drilldownCategories.length < 1}
            title={
              <span
                style={{ fontSize: '14px' }}
                className="iconfont icon-iconxiazuan"
              >
                <span style={{ marginLeft: '8px' }}>下钻</span>
              </span>
            }
          >
            {drilldownCategories
              ? drilldownCategories.map((col) =>
                  isPivotTableVal ? (
                    <Menu.SubMenu key={col.name} title={col.name}>
                      <Menu.Item key="row">行</Menu.Item>
                      <Menu.Item key="col">列</Menu.Item>
                    </Menu.SubMenu>
                  ) : (
                    <Menu.Item key={col.name}>{col.name}</Menu.Item>
                  )
                )
              : ''}
          </Menu.SubMenu>
        ) : (
          ''
        )}
      </Menu>
    )
  }

  return renderComponent

  function drill(e) {
    const path = e.keyPath
    if (path && path.length > 2) {
      onDataDrillDown(path[1], path[0])
    } else {
      switch (path[1]) {
        case DrillType.UP:
          onDataDrillUp(path[0])
          break
        case 'drillAll':
          const type = path[0].split('|')
          if (type) {
            if (type[1] === DrillType.UP) {
              onDataDrillUp(type[0])
            } else if (type[1] === DrillType.DOWN) {
              onDataDrillDown(type[0])
            }
          }
          break
        default:
          break
      }
    }
  }
  function drillpath() {
    onDataDrillPath()
  }
  function isPivotTable(selectedCharts) {
    const pivotChart = getPivot()
    const result =
      Array.isArray(selectedCharts) &&
      selectedCharts.every((sc) => sc.chart.id === pivotChart.id)
    return !isPivot ? false : result
  }
}

export default DataDrill

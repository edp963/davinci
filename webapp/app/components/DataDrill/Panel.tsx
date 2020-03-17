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

import React, {useMemo, useCallback, useEffect} from 'react'
import { Menu, Icon } from 'antd'
import { getPivot } from 'containers/Widget/components/util'
import { 
  DrillType,
  ModelTypeName,
  getModelsByTypeName,
  filterModelByModelType
} from './util'
import { ViewModelTypes } from 'containers/View/constants'
const styles = require('./datadrill.less')
export interface IDataDrillProps {
  widgetConfig: any
  drillHistory?: any
  widgetMode?: string
  key?: string | number
  drillpathSetting?: any
  currentData?: object[]
  onDataDrillPath?: () => any
  onDataDrill?: (name?: string, dimensions?: string) => any
}


const Datadrill: React.FC<IDataDrillProps> =  (props: IDataDrillProps) => {
  const { onDataDrill, onDataDrillPath, currentData, widgetMode, drillHistory, widgetConfig, drillpathSetting } = props

  let renderComponent = void 0

  let menuDisabled = void 0

  const modelWithModelType: getModelsByTypeName = useMemo(() => filterModelByModelType(widgetConfig && widgetConfig.model), [widgetConfig])

  const getModelByModelType = useCallback((typeName: ModelTypeName) => {
    return modelWithModelType(typeName)
  }, [widgetConfig])

  const currentCategories = useMemo(() => {
    return currentData && currentData[0] ? Object.keys(currentData[0]) : []
  }, [currentData])
  
  const getCategoriesModels = useMemo(() => {
    return getModelByModelType(ViewModelTypes.Category)
  }, [widgetConfig])

  const {drilldownCategories, drillupCategories } = useMemo(() => {
    return {
      drillupCategories: getCategoriesModels.filter((cate) => currentCategories.includes(cate))
      .map((c) => ({ name: c, modelType: ViewModelTypes.Category, drillType: DrillType.UP})),
      drilldownCategories: getCategoriesModels.filter((cate) => !currentCategories.includes(cate))
      .map((c) => ({name: c,  modelType: ViewModelTypes.Category, drillType: DrillType.DOWN}))
    }
  }, [widgetConfig, currentData])

  const drillHistoryGroups = useMemo(() => {
    if (drillHistory && drillHistory.length) {
      return drillHistory[drillHistory.length - 1]['groups']
    }
  }, [drillHistory])

  const drillOtherCategories = useMemo(() => {
    return drillHistoryGroups && drillHistoryGroups.length 
    ? getCategoriesModels.filter((cate) => !(drillHistory.some((his) => his.name === cate)))
      .map((name) => ({name, modelType: ViewModelTypes.Category,  drillType: drillHistoryGroups.includes(name) ? DrillType.UP : DrillType.DOWN}))
    : drilldownCategories
  }, [drillHistory])

  const isPivot = useMemo(() => widgetMode === 'pivot', [widgetMode])

  const isPivotTableVal = useMemo(() => isPivotTable(widgetConfig.metrics), [widgetConfig])

  if (drillpathSetting && drillpathSetting.length) {
    if (drillHistory && drillHistory.length) {
      menuDisabled = drillHistory.length === drillpathSetting.length - 1
    }
    renderComponent = (
      <Menu onClick={drillpath} style={{ width: 120 }} mode="vertical">
        <Menu.Item key="drillpath" disabled={menuDisabled}>
        <span style={{fontSize: '14px'}} className="iconfont icon-iconxiazuan">
            <span style={{marginLeft: '8px'}}>下钻</span></span>
        </Menu.Item>
      </Menu>
    )
  } else {
    renderComponent = (
      <Menu onClick={drill} style={{ width: 120 }} mode="vertical">
      {
        isPivot ?
        <Menu.SubMenu
          key="sub2"
          disabled={drillupCategories.length < 2}
          title={<span style={{fontSize: '14px'}} className="iconfont icon-iconxiazuan1">
          <span style={{marginLeft: '8px'}}>上卷</span></span>}
        >
          {drillupCategories ? drillupCategories.map((col) => <Menu.Item key={col.name}>{col.name}</Menu.Item>) : ''}
        </Menu.SubMenu> :
        <Menu.SubMenu
          key="sub3"
          disabled={drillOtherCategories.length < 1}
          title={<span style={{fontSize: '14px'}} className="iconfont icon-iconxiazuan">
          <span style={{marginLeft: '8px'}}>钻取</span></span>}
        >
          {drillOtherCategories ?
            drillOtherCategories.map((col) =>
            <Menu.Item key={col.name}>
              <span className={styles.items}>
                <span>{col.name}</span>
                <span><Icon type={`${col.drillType === 'up' ? 'arrow-up' : 'arrow-down'}`} /></span>
              </span>
            </Menu.Item>)
            : ''}
        </Menu.SubMenu>
      }
      {
        isPivot ?
        <Menu.SubMenu
          key="sub1"
          disabled={drilldownCategories.length < 1}
          title={<span style={{fontSize: '14px'}} className="iconfont icon-iconxiazuan">
          <span style={{marginLeft: '8px'}}>下钻</span></span>}
        >
          {drilldownCategories ? drilldownCategories.map((col) => isPivotTableVal ? <Menu.SubMenu key={col.name} title={col.name}><Menu.Item key="row">行</Menu.Item>
          <Menu.Item key="col">列</Menu.Item>
          </Menu.SubMenu> : <Menu.Item key={col.name}>{col.name}</Menu.Item>) : ''}
        </Menu.SubMenu> : ''
      }
      </Menu>
    )
  }

  return renderComponent

  function drill (e) {
    const path = e.keyPath
    if (path && path.length > 2) {
      onDataDrill(path[1], path[0])
    } else {
      onDataDrill(path[0])
    }
  }
  function drillpath () {
    onDataDrillPath()
  }
  function isPivotTable (selectedCharts) {
    const pivotChart = getPivot()
    const result = Array.isArray(selectedCharts) && selectedCharts.every((sc) => sc.chart.id === pivotChart.id)
    return !isPivot ? false : result
  }
}



export default Datadrill

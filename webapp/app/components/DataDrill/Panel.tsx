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

import * as React from 'react'
import { Menu, Icon } from 'antd'
import { getPivot } from 'containers/Widget/components/util'
const styles = require('./datadrill.less')
export interface IDataDrillProps {
  key?: string | number
  widgetMode?: string
  onDataDrill?: (name?: string, dimensions?: string) => any
  onDataDrillPath?: () => any
  drillHistory?: any
  drillpathSetting?: any
  categoriesCol: ICategories[]
  currentData?: object[]
  widgetConfig: any
}
export interface ICategories {
  name?: string,
  type?: string
  visualType?: string
}

export function DataDrill (props: IDataDrillProps) {
  const { categoriesCol, onDataDrill, onDataDrillPath, currentData, widgetMode, drillHistory, widgetConfig, drillpathSetting } = props
  let drilldownCategories = []
  let drillupCategories = []
  let drillOtherCategories = []
  if (currentData && currentData.length) {
    drilldownCategories = categoriesCol.filter((cate) => {
      let vaildate = void 0
      Object.keys(currentData[0]).some((data) => {
        vaildate = cate.name !== data
        if (cate.name === data) {
          return true
        }
      })
      return vaildate
    }).map((down) => {
      return {
        ...down,
        drillType: 'down'
      }
    })
    drillupCategories = Object.keys(currentData[0]).filter((data) => {
      let vaildate = void 0
      categoriesCol.every((cate) => {
        vaildate = data === cate.name
        if (data !== cate.name) {
          return true
        }
      })
      return vaildate
    }).map((up) => {
      return {
        name: up,
        type: 'category',
        visualType: 'string',
        drillType: 'up'
      }
    })
  }
  if (drillHistory && drillHistory.length) {
    const drillHistoryCol = drillHistory[drillHistory.length - 1]['groups']
    drillOtherCategories = categoriesCol.filter((cate) => {
      let vaildate = void 0
      drillHistory.some((data) => {
        vaildate = cate.name !== data.name
        if (cate.name === data.name) {
          return true
        }
      })
      return vaildate
    }).map((down) => {
      return {
        ...down,
        drillType: drillHistoryCol.some((col) => col === down.name) ? 'up' : 'down'
      }
    })
  } else {
    drillOtherCategories = drilldownCategories
  }
  const isPivot = widgetMode === 'pivot'
  const isPivotTableVal = isPivotTable(widgetConfig.metrics)
  let renderComponent = void 0
  let menuDisabled = void 0
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
    const result = Array.isArray(selectedCharts) && selectedCharts.every(function (sc) {
      return sc.chart.id === pivotChart.id
    })
    if (!isPivot) {
      return false
    }
    return result
  }
}



export default DataDrill

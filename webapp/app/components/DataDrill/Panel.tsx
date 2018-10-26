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
const Icon = require('antd/lib/icon')
const Menu = require('antd/lib/menu')

export interface IDataDrillProps {
  onDataDrill?: (e: any) => any
  categoriesCol?: ICategories[]
  currentData?: object[]
}
export interface ICategories {
  name?: string,
  type?: string
  visualType?: string
}

export function DataDrill (props: IDataDrillProps) {
  const { categoriesCol, onDataDrill, currentData } = props
  let drilldownCategories = []
  let drillupCategories = []
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
  return (
    <Menu onClick={drill} style={{ width: 120 }} mode="vertical">
      <Menu.SubMenu
        key="sub2"
        disabled={drillupCategories.length < 2}
        title={<span style={{fontSize: '14px'}} className="iconfont icon-iconxiazuan1">
        <span style={{marginLeft: '8px'}}>上卷</span></span>}
      >
        {drillupCategories ? drillupCategories.map((col) => <Menu.Item key={col.name}>{col.name}</Menu.Item>) : ''}
      </Menu.SubMenu>
      <Menu.SubMenu
        key="sub1"
        disabled={drilldownCategories.length < 1}
        title={<span style={{fontSize: '14px'}} className="iconfont icon-iconxiazuan">
        <span style={{marginLeft: '8px'}}>下钻</span></span>}
      >
        {drilldownCategories ? drilldownCategories.map((col) => <Menu.Item key={col.name}>{col.name}</Menu.Item>) : ''}
      </Menu.SubMenu>
    </Menu>
  )
  function drill (e) {
    const name = e.key
    if (onDataDrill) {
      onDataDrill(name)
    }
  }
}



export default DataDrill

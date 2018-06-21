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
import { Link } from 'react-router'

const Icon = require('antd/lib/icon')
const Tooltip = require('antd/lib/tooltip')
const Popconfirm = require('antd/lib/popconfirm')
const Menu = require('antd/lib/menu')
const Dropdown = require('antd/lib/dropdown')
const Modal = require('antd/lib/modal')

const styles = require('../Display.less')

import displaySettings from '../../../assets/json/displaySettings'
import LayerSelector from './LayerSelector'

import {
  GraphTypes,
  SecondaryGraphTypes } from '../constants'

interface IDisplayHeaderProps {
  widgets: any[],
  currentLayersStatus: object
  loginUser: any
  onAddLayers: (layers: any[]) => void
  onDeleteLayers: (ids: number[]) => void
}

interface IDisplayHeaderStates {
  widgetSelectorVisible: boolean,
  widgetSelectorLoading: boolean,
  widgetsSelected: any[]
}

export class DisplayHeader extends React.Component<IDisplayHeaderProps, IDisplayHeaderStates> {
  constructor (props) {
    super(props)
    this.state = {
      widgetSelectorVisible: false,
      widgetSelectorLoading: false,
      widgetsSelected: []
    }
  }

  private showWidgetSelector = () => {
    this.setState({
      widgetSelectorVisible: true
    })
  }

  private hideWidgetSelector = () => {
    this.setState({
      widgetSelectorLoading: false,
      widgetSelectorVisible: false
    })
  }

  private getDefaultSetting = (graphType: GraphTypes, secondaryGraphType?: SecondaryGraphTypes) => {
    const name = secondaryGraphType ? secondaryGraphType.toLowerCase() : graphType.toLowerCase()
    const setting = displaySettings.find((ds) => ds.name === name)
    if (!setting) {
      return {}
    }
    const defaultSetting = {}
    setting.params.forEach((param) => {
      param.items.forEach((item) => {
        defaultSetting[item.name] = item.default || null
      })
    })
    return defaultSetting
  }

  private onWidgetsSelectDone = (selectedWidgets, fieldValues) => {
    const { trigger_type, trigger_params  } = fieldValues
    const layers = selectedWidgets.map((w) => ({
      widget_id: w.id,
      name: w.name,
      graphType: GraphTypes.Chart,
      layer_params: JSON.stringify(this.getDefaultSetting(GraphTypes.Chart)),
      trigger_type,
      trigger_params
    }))

    this.props.onAddLayers(layers)
    this.setState({
      widgetsSelected: [],
      widgetSelectorVisible: false
    })
  }

  private addSecondaryGraph = (secondaryGraphType: SecondaryGraphTypes) => () => {
    switch (secondaryGraphType) {
      case SecondaryGraphTypes.Rectangle:
      case SecondaryGraphTypes.Label:
        this.props.onAddLayers([{
          name: secondaryGraphType,
          graphType: GraphTypes.Secondary,
          secondaryGraphType,
          layer_params: JSON.stringify(this.getDefaultSetting(GraphTypes.Secondary, secondaryGraphType))
        }])
        break
      default:
        break
    }
  }

  private deleteLayers = () => {
    const { currentLayersStatus, onDeleteLayers } = this.props
    const ids = Object.keys(currentLayersStatus).filter((id) => currentLayersStatus[id]).map((id) => +id)
    onDeleteLayers(ids)
  }

  public render () {
    const {
      widgetSelectorVisible,
      widgetSelectorLoading,
      widgetsSelected
    } = this.state

    const {
      loginUser,
      widgets
    } = this.props

    const menu = (
      <Menu>
        <Menu.Item>
          <i
            className="iconfont icon-rounded-rect"
            onClick={this.addSecondaryGraph(SecondaryGraphTypes.Rectangle)}
          > 矩形
          </i>
        </Menu.Item>
        <Menu.Item>
          <i
            className="iconfont icon-rect-text"
            onClick={this.addSecondaryGraph(SecondaryGraphTypes.Label)}
          > 标签
          </i>
        </Menu.Item>
      </Menu>
    )

    return (
      <div className={styles.header}>
        <div className={styles.commands}>
          <ul className={styles.historyBack}>
            <li>
              <Tooltip placement="bottom" title="返回">
                <Link to="/displays">
                  <Icon type="left-circle-o"/>
                </Link>
              </Tooltip>
            </li>
          </ul>
          <ul className={styles.commandGroup}>
            <li>
              <Tooltip placement="bottom" title="Widgets">
                <i className={`iconfont icon-chart-bar ${styles.primary}`} onClick={this.showWidgetSelector} />
              </Tooltip>
            </li>
            <li>
              <Tooltip placement="rightBottom" title="辅助图形">
                <Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
                  <Icon type="appstore" className={styles.primary} />
                </Dropdown>
              </Tooltip>
            </li>
          </ul>
          <ul className={styles.commandGroup}>
            <li>
              <Tooltip placement="bottom" title="复制">
                <i className="iconfont icon-fuzhi" />
              </Tooltip>
            </li>
            <li>
              <Tooltip placement="bottom" title="粘贴">
                <i className="iconfont icon-niantie" />
              </Tooltip>
            </li>
            <li>
              <Tooltip placement="bottom" title="撤销">
                <i className="iconfont icon-chexiao" />
              </Tooltip>
            </li>
            <li>
              <Tooltip placement="bottom" title="前进">
                <i className="iconfont icon-qianjin" />
              </Tooltip>
            </li>
            <li>
              <Popconfirm
                  title="确定删除？"
                  placement="bottom"
                  onConfirm={this.deleteLayers}
              >
                <Tooltip title="删除" placement="right">
                  <Icon type="delete"/>
                </Tooltip>
              </Popconfirm>
            </li>
          </ul>
        </div>
        <LayerSelector
          visible={widgetSelectorVisible}
          multiple={true}
          modalLoading={widgetSelectorLoading}
          widgets={widgets}
          selectedWidgets={[]}
          loginUser={loginUser}
          onSelectDone={this.onWidgetsSelectDone}
          onCancel={this.hideWidgetSelector}
        />
      </div>
    )
  }
}

export default DisplayHeader

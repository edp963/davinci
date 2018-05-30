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

import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { uuid } from '../../../utils/util'

const Icon = require('antd/lib/icon')
const Tooltip = require('antd/lib/tooltip')
const Popconfirm = require('antd/lib/popconfirm')
const Menu = require('antd/lib/menu')
const Dropdown = require('antd/lib/dropdown')
const Modal = require('antd/lib/modal')

const styles = require('../Display.less')

import displaySettings from '../../../assets/json/displaySettings'
import WidgetSelector from '../../Widget/components/WidgetSelector'

import {
  GraphTypes,
  SecondaryGraphTypes } from '../constants'
import { makeSelectLayers, makeSelectLayerStatus } from '../selectors'
import {
  selectWidgetLayers,
  addSecondaryGraphLayer,
  deleteLayers } from '../actions'
interface IDisplayHeaderProps {
  layerStatus: object,
  onSelectWidgetLayers: (widgetLayers: any[]) => void,
  onAddSecondaryGraphLayer: (layer: any) => void,
  onDeleteLayers?: (ids: any[]) => void
}

interface IDisplayHeaderStates {
  widgetSelectorVisible: boolean,
  widgets: any[]
}

export class DisplayHeader extends React.Component<IDisplayHeaderProps, IDisplayHeaderStates> {
  constructor (props) {
    super(props)
    this.state = {
      widgetSelectorVisible: false,
      widgets: []
    }
  }

  private showWidgetSelector = () => {
    this.setState({
      widgetSelectorVisible: true
    })
  }

  private hideWidgetSelector = () => {
    this.setState({
      widgetSelectorVisible: false
    })
  }

  private onWidgetsSelect = (widgets) => {
    this.setState({ widgets })
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

  private onWidgetsSelectDone = () => {
    const widgets = this.state.widgets
    const layers = widgets.map((w) => ({
      ...w,
      id: uuid(6, 10),
      graphType: GraphTypes.Chart,
      layer_params: JSON.stringify(this.getDefaultSetting(GraphTypes.Chart))
    }))

    this.props.onSelectWidgetLayers(layers)
    this.setState({
      widgets: [],
      widgetSelectorVisible: false
    })
  }

  private addSecondaryGraph = (secondaryGraphType: SecondaryGraphTypes) => () => {
    switch (secondaryGraphType) {
      case SecondaryGraphTypes.Rectangle:
        this.props.onAddSecondaryGraphLayer({
          id: uuid(6, 10),
          name: secondaryGraphType,
          graphType: GraphTypes.Secondary,
          secondaryGraphType,
          layer_params: JSON.stringify(this.getDefaultSetting(GraphTypes.Secondary, secondaryGraphType))
        })
        break
      default:
        break
    }
  }

  private deleteLayers = () => {
    const { layerStatus, onDeleteLayers } = this.props
    const ids = Object.keys(layerStatus).filter((id) => layerStatus[id])
    onDeleteLayers(ids)
  }

  public render () {
    const {
      widgetSelectorVisible,
      widgets
    } = this.state

    const menu = (
      <Menu>
        <Menu.Item>
          <i
            className="iconfont icon-rounded-rect"
            onClick={this.addSecondaryGraph(SecondaryGraphTypes.Rectangle)}
          > 矩形
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
                <Icon type="left-circle-o" />
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
                  <Icon type="delete" onClick={this.deleteLayers}/>
                </Tooltip>
              </Popconfirm>
            </li>
          </ul>
        </div>
        <Modal
          title="选择 Widgets"
          wrapClassName="ant-modal-large"
          visible={widgetSelectorVisible}
          onCancel={this.hideWidgetSelector}
          onOk={this.onWidgetsSelectDone}
        >
          <WidgetSelector multiple={true} onWidgetsSelect={this.onWidgetsSelect}/>
        </Modal>
      </div>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  layerStatus: makeSelectLayerStatus()
})

export function mapDispatchToProps (dispatch) {
  return {
    onSelectWidgetLayers: (widgets) => dispatch(selectWidgetLayers(widgets)),
    onAddSecondaryGraphLayer: (layer) => dispatch(addSecondaryGraphLayer(layer)),
    onDeleteLayers: (ids) => dispatch(deleteLayers(ids))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DisplayHeader)

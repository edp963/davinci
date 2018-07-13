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
import { Link } from 'react-router'

const Icon = require('antd/lib/icon')
const Tooltip = require('antd/lib/tooltip')
const Popconfirm = require('antd/lib/popconfirm')
const Popover = require('antd/lib/popover')
const Menu = require('antd/lib/menu')
const Dropdown = require('antd/lib/dropdown')
const Modal = require('antd/lib/modal')

const styles = require('../Display.less')

import slideSettings from '../../../assets/json/slideSettings'
import LayerSelector from './LayerSelector'
import SharePanel from '../../../components/SharePanel'

import {
  makeSelectCurrentDisplayShareInfo,
  makeSelectCurrentDisplaySecretInfo,
  makeSelectCurrentDisplayShareInfoLoading
} from '../selectors'

import {
  uuid,
  GraphTypes,
  SecondaryGraphTypes } from 'utils/util'

interface IDisplayHeaderProps {
  params: any
  display: any
  widgets: any[]
  currentLayersStatus: object
  loginUser: any
  onAddLayers: (layers: any[]) => void
  onDeleteLayers: (ids: number[]) => void
}

interface IDisplayHeaderStates {
  widgetSelectorVisible: boolean,
  widgetSelectorLoading: boolean,
  widgetsSelected: any[],
  displaySharePanelAuthorized: boolean
}

export class DisplayHeader extends React.Component<IDisplayHeaderProps, IDisplayHeaderStates> {
  constructor (props) {
    super(props)
    this.state = {
      widgetSelectorVisible: false,
      widgetSelectorLoading: false,
      widgetsSelected: [],
      displaySharePanelAuthorized: false
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
    const type = secondaryGraphType || graphType
    const setting = slideSettings[type]
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
    const { triggerType, triggerParams  } = fieldValues
    const layers = selectedWidgets.map((w) => ({
      widgetId: w.id,
      name: w.name,
      type: GraphTypes.Chart,
      params: JSON.stringify(this.getDefaultSetting(GraphTypes.Chart)),
      // triggerType,
      // triggerParams
    }))

    this.props.onAddLayers(layers)
    this.setState({
      widgetsSelected: [],
      widgetSelectorVisible: false
    })
  }

  private addSecondaryGraph = (secondaryGraphType: SecondaryGraphTypes) => () => {
    const title = (slideSettings[secondaryGraphType] as any).title
    this.props.onAddLayers([{
      name: `${title}_${uuid(5)}`,
      type: GraphTypes.Secondary,
      subType: secondaryGraphType,
      params: JSON.stringify(this.getDefaultSetting(GraphTypes.Secondary, secondaryGraphType))
    }])
  }

  private deleteLayers = () => {
    const { currentLayersStatus, onDeleteLayers } = this.props
    const ids = Object.keys(currentLayersStatus).filter((id) => currentLayersStatus[id]).map((id) => +id)
    onDeleteLayers(ids)
  }

  private changeDisplaySharePanelAuthorizeState = (state) => () => {
    this.setState({ displaySharePanelAuthorized: state })
  }

  public renderShare () {
    const { display, currentDisplayShareInfo, currentDisplaySecretInfo, currentDisplayShareInfoLoading } = this.props
    if (!display) { return null }

    const { displaySharePanelAuthorized } = this.state
    return (
      <Popover
        placement="bottomRight"
        content={
          <SharePanel
            id={display.id}
            shareInfo={currentDisplayShareInfo}
            secretInfo={currentDisplaySecretInfo}
            shareInfoLoading={currentDisplayShareInfoLoading}
            authorized={displaySharePanelAuthorized}
            afterAuthorization={this.changeDisplaySharePanelAuthorizeState(true)}
            type="display"
          />
        }
        trigger="click"
      >
        <Tooltip placement="bottom" title="分享">
          <Icon type="share-alt" onClick={this.changeDisplaySharePanelAuthorizeState(false)}/>
        </Tooltip>
      </Popover>
    )
  }

  public render () {
    const {
      widgetSelectorVisible,
      widgetSelectorLoading,
      widgetsSelected
    } = this.state

    const {
      params,
      loginUser,
      widgets
    } = this.props

    const {pid, displayId} = params

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
                <Link to={`/project/${pid}/displays`}>
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
          <ul className={styles.commandGroup}>
            <li>
              <Tooltip placement="bottom" title="预览">
                <a href={`/#/project/${pid}/display/preview/${displayId}`} target="_blank">
                  <i className="iconfont icon-preview" />
                </a>
              </Tooltip>
            </li>
            <li>
              {this.renderShare()}
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

const mapStateToProps = createStructuredSelector({
  currentDisplayShareInfo: makeSelectCurrentDisplayShareInfo(),
  currentDisplaySecretInfo: makeSelectCurrentDisplaySecretInfo(),
  currentDisplayShareInfoLoading: makeSelectCurrentDisplayShareInfoLoading()
})

export default connect<{}, {}, IDisplayHeaderProps>(mapStateToProps, null)(DisplayHeader)

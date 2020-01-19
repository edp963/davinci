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
import * as classnames from 'classnames'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Link } from 'react-router'

import { Icon, Tooltip, Popover, Menu, Dropdown } from 'antd'

const styles = require('../Display.less')

import { slideSettings, GraphTypes, SecondaryGraphTypes } from './util'
import LayerSelector from './LayerSelector'
import SharePanel from 'components/SharePanel'

import {
  makeSelectCurrentDisplayShareInfo,
  makeSelectCurrentDisplaySecretInfo,
  makeSelectCurrentDisplayShareInfoLoading
} from '../selectors'

import { uuid } from 'utils/util'

interface IDisplayHeaderProps {
  params: any
  display: any
  widgets: any[]
  currentDisplayShareInfo?: string
  currentDisplaySecretInfo?: string
  currentDisplayShareInfoLoading?: boolean
  canUndo: boolean
  canRedo: boolean
  onAddLayers: (layers: any[], viewId?: number[]) => void
  onDeleteLayers: () => void
  onCopyLayers: () => void
  onPasteLayers: () => void
  onUndo: () => void
  onRedo: () => void
  onLoadDisplayShareLink: (id: number, authName: string) => void
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
    const { polling, frequency  } = fieldValues
    const layers = selectedWidgets.map((w) => ({
      widgetId: w.id,
      name: w.name,
      type: GraphTypes.Chart,
      params: JSON.stringify({
        ...this.getDefaultSetting(GraphTypes.Chart),
        polling,
        frequency
      })
    }))
    let viewIds = selectedWidgets.map((w) => w.viewId)
    viewIds = viewIds.filter((viewId, idx) => viewIds.indexOf(viewId) === idx)

    this.props.onAddLayers(layers, viewIds)
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
    const { onDeleteLayers } = this.props
    onDeleteLayers()
  }

  private changeDisplaySharePanelAuthorizeState = (state) => () => {
    this.setState({ displaySharePanelAuthorized: state })
  }

  public renderShare () {
    const {
      display,
      currentDisplayShareInfo,
      currentDisplaySecretInfo,
      currentDisplayShareInfoLoading,
      onLoadDisplayShareLink } = this.props
    if (!display) { return null }

    const { displaySharePanelAuthorized } = this.state
    return (
      <Popover
        placement="bottomRight"
        content={
          <SharePanel
            id={display.id}
            type="display"
            shareInfo={currentDisplayShareInfo}
            secretInfo={currentDisplaySecretInfo}
            shareInfoLoading={currentDisplayShareInfoLoading}
            authorized={displaySharePanelAuthorized}
            afterAuthorization={this.changeDisplaySharePanelAuthorizeState(true)}
            onLoadDisplayShareLink={onLoadDisplayShareLink}
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

  private onUndoClick = () => {
    const { canUndo, onUndo } = this.props
    if (canUndo) {
      onUndo()
    }
  }

  private onRedoClick = () => {
    const { canRedo, onRedo } = this.props
    if (canRedo) {
      onRedo()
    }
  }

  public render () {
    const {
      widgetSelectorVisible,
      widgetSelectorLoading,
      widgetsSelected
    } = this.state

    const {
      params,
      widgets,
      onDeleteLayers,
      onCopyLayers,
      onPasteLayers,
      canUndo,
      canRedo
    } = this.props

    const {pid, displayId} = params

    const undoClass = classnames({
      [styles.disabled]: !canUndo
    })
    const redoClass = classnames({
      [styles.disabled]: !canRedo
    })

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
        <Menu.Item>
          <i
            className="iconfont icon-video"
            onClick={this.addSecondaryGraph(SecondaryGraphTypes.Video)}
          > 视频
          </i>
        </Menu.Item>
        <Menu.Item>
          <i
            className="iconfont icon-clock"
            onClick={this.addSecondaryGraph(SecondaryGraphTypes.Timer)}
          > 时间器
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
                <Link to={`/project/${pid}/vizs`}>
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
                <i className="iconfont icon-fuzhi" onClick={onCopyLayers} />
              </Tooltip>
            </li>
            <li>
              <Tooltip placement="bottom" title="粘贴">
                <i className="iconfont icon-niantie" onClick={onPasteLayers} />
              </Tooltip>
            </li>
            <li className={undoClass}>
              <Tooltip placement="bottom" title="撤销">
                <i className={`iconfont icon-chexiao`} onClick={this.onUndoClick} />
              </Tooltip>
            </li>
            <li className={redoClass}>
              <Tooltip placement="bottom" title="前进">
                <i className="iconfont icon-qianjin" onClick={this.onRedoClick} />
              </Tooltip>
            </li>
            <li>
              <Tooltip placement="bottom" title="删除">
                <Icon type="delete" onClick={this.deleteLayers}/>
              </Tooltip>
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

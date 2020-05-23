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

import React from 'react'
import classnames from 'classnames'

import { Radio, Select, Button, Icon, message } from 'antd'
const RadioGroup = Radio.Group
const Option = Select.Option


import { SQL_NUMBER_TYPES, SQL_DATE_TYPES } from 'app/globalConstants'
const utilStyles = require('assets/less/util.less')
const styles = require('../Dashboard.less')

interface IDrillPathSettingProps {
  widgets: any[]
  views: any[]
  itemId: number | boolean
  selectedWidget: number[]
  drillpathSetting: any[]
  saveDrillPathSetting: (flag: any) => any
  cancel: () => any
}

interface IDrillPathSettingStates {
  screenWidth: number
  value: number
  pathNodes: IPathNode[]
  pathOrFree: string
}

export interface IPathNode {
  views: any[]
  widget: string
  enter: string
  out: string
  enterType: string
  outType: string
  nextRelation: string
  enterErrorMessage: string
  outErrorMessage: string
}

export class DrillPathSetting extends React.PureComponent<IDrillPathSettingProps, IDrillPathSettingStates> {
  constructor (props) {
    super(props)
    this.state = {
      screenWidth: 0,
      value: 1,
      pathNodes: [],
      pathOrFree: 'free'
    }
  }
  private getViewList = (widgetId) => {
    const {views, widgets} = this.props
    const view = views.find((view) => view.id === (widgets.find((widget) => widget.id === widgetId))['viewId'])
    const { model } = view
    const modelObj = JSON.parse(model)
    const viewLists = []
    Object.entries(modelObj).forEach(([key, m]) => {
      m['name'] = key
      viewLists.push(m)
    })
    return viewLists
  }
  private init = () => {
    const {selectedWidget, drillpathSetting} = this.props
    const viewLists = this.getViewList(selectedWidget[0])
    let newPathNodes = void 0
    if (drillpathSetting && drillpathSetting.length) {
      newPathNodes = drillpathSetting
      this.setState({
        pathOrFree: 'path'
      })
    } else {
      newPathNodes = [{
        widget: `${selectedWidget[0]}`,
        views: viewLists,
        enter: '',
        out: '',
        enterType: '',
        outType: '',
        nextRelation: '=',
        enterErrorMessage: '',
        outErrorMessage: ''
      }]
    }
    this.setState({
      pathNodes: newPathNodes
    })
  }
  public componentWillMount () {
    this.init()
  }

  public componentWillReceiveProps (nextProps) {
    window.addEventListener('resize', this.getScreenWidth, false)
    const {selectedWidget, drillpathSetting} = this.props
    const nextSelectedWidget = nextProps.selectedWidget
    const nextDrillpathSetting = nextProps.drillpathSetting
    if (selectedWidget[0] !== nextSelectedWidget [0]) {
      const startPathObj = this.state.pathNodes[0]
      startPathObj['widget'] = nextSelectedWidget[0]
      const newPathNodes = [...this.state.pathNodes]
      newPathNodes.splice(0, 1, startPathObj)
      this.setState({
        pathNodes: newPathNodes
      })
    }
  }

  public componentWillUnmount () {
    window.removeEventListener('resize', this.getScreenWidth, false)
  }

  private getScreenWidth = () => {
    this.setState({ screenWidth: document.documentElement.clientWidth })
  }

  private  onChange = (e) => {
    this.setState({
      pathOrFree: e.target.value
    })
  }

  private generateFilterOperatorOptions = (type) => {
    const operators = [
      ['=', 'like', '>', '<', '>=', '<=', '!='],
      ['=', '>', '<', '>=', '<=', '!=']
    ]

    const stringOptions = operators[0].slice().map((o) => (
      <Option key={o} value={o}>{o}</Option>
    ))

    const numbersAndDateOptions = operators[1].slice().map((o) => (
      <Option key={o} value={o}>{o}</Option>
    ))

    if (SQL_NUMBER_TYPES.indexOf(type) >= 0 || SQL_DATE_TYPES.indexOf(type) >= 0) {
      return numbersAndDateOptions
    } else {
      return stringOptions
    }
  }

  private add = () => {
    const obj = {
      widget: '',
      views: [],
      enter: '',
      out: '',
      enterType: '',
      outType: '',
      nextRelation: '=',
      enterErrorMessage: '',
      outErrorMessage: ''
    }
    const {pathNodes} = this.state
    const newNodes = pathNodes.concat(obj)
    this.setState({
      pathNodes: newNodes
    })
  }

  private remove = (index: number) => () => {
    const pathNodes = [...this.state.pathNodes]
    pathNodes.splice(index, 1)
    this.setState({
      pathNodes
    })
  }

  private saveDrillPathSetting = () => {
    const {saveDrillPathSetting} = this.props
    const result = this.checkDrillPathSettingValidate()
    if (result && saveDrillPathSetting) {
      if (this.state.pathOrFree === 'free') {
        saveDrillPathSetting([])
      } else {
        saveDrillPathSetting(this.state.pathNodes)
      }
      this.hideDrillPathSettingModal()
    }
  }

  private getNewPathNodes = (index, field, value) => {
    const startPathObj = this.state.pathNodes[index]
    startPathObj[field] = value
    const newPathNodes = [...this.state.pathNodes]
    newPathNodes.splice(index, 1, startPathObj)
    return newPathNodes
  }

  private checkDrillPathSettingValidate = () => {
    const { pathNodes, pathOrFree } = this.state
    let validate = true
    if (pathOrFree === 'path' && pathNodes.length === 1) {
      validate = false
      message.error('至少设置两个路径')
    }
    for (let index = 0, l = pathNodes.length;  index < l; index++) {
      const node = pathNodes[index]
      if (index !== 0) {
        if (node.enter === '') {
          const newPathNodes = this.getNewPathNodes(index, 'enterErrorMessage', '入参为必填项')
          this.setState({
            pathNodes: newPathNodes
          })
          validate = false
          return validate
        } else {
          const newPathNodes = this.getNewPathNodes(index, 'enterErrorMessage', '')
          this.setState({
            pathNodes: newPathNodes
          })
        }
      }
      if (index !== (this.state.pathNodes.length - 1)) {
        if (node.out === '') {
          const newPathNodes = this.getNewPathNodes(index, 'outErrorMessage', '出参为必填项')
          this.setState({
            pathNodes: newPathNodes
          })
          validate = false
          return validate
        } else {
          const newPathNodes = this.getNewPathNodes(index, 'outErrorMessage', '')
          this.setState({
            pathNodes: newPathNodes
          })
        }
      }
    }
    return validate
  }

  private hideDrillPathSettingModal = () => {
    const {cancel} = this.props
    if (cancel) {
      cancel()
    }
  }

  private changeWidget = (index) => (value) => {
    const startPathObj = this.state.pathNodes[index]
    const viewLists = this.getViewList(Number(value))
    startPathObj['widget'] = value
    startPathObj['views'] = viewLists
    const newPathNodes = [...this.state.pathNodes]
    newPathNodes.splice(index, 1, startPathObj)
    this.setState({
      pathNodes: newPathNodes
    })
    const result = this.checkDrillPathSettingValidate()
  }

  private changeParams = (index, category, views?: any[]) => (value) => {
    const startPathObj = this.state.pathNodes[index]
    startPathObj[category] = value
    if (views && views.length) {
      startPathObj[`${category}Type`] = (views.find((view) => view.name === value))['sqlType']
    }
    const newPathNodes = [...this.state.pathNodes]
    newPathNodes.splice(index, 1, startPathObj)
    this.setState({
      pathNodes: newPathNodes
    })
    const result = this.checkDrillPathSettingValidate()
  }

  public render () {
    const {
      itemId,
      widgets,
      views,
      selectedWidget,
      drillpathSetting
    } = this.props
    const {
      screenWidth,
      pathNodes
    } = this.state
    const formItemStyle = {
      marginBottom: '8px'
    }
    const drillSettingButtons =
    [(
      <Button
        key="forward"
        size="large"
        type="primary"
        onClick={this.hideDrillPathSettingModal}
      >
        取 消
      </Button>
    ), (
      <Button
        key="submit"
        size="large"
        type="primary"
        onClick={this.saveDrillPathSetting}
      >
        保 存
      </Button>
    )]
    const widgetOptions = widgets.length && widgets.map((widget) => (
      <Option value={`${widget.id}`} key={`widgetoption${widget.viewId}`}>{widget.name}</Option>
    ))
    const pathDrill = pathNodes.length && pathNodes.map((node, index) => {
      const paramOptions = node && node.views && node.views.map((view) => {
        return (
        <Option value={`${view.name}`} key={`widgetoption${view.name}`}>{view.name}</Option>
      )})
      const relationOptions = this.generateFilterOperatorOptions(node.outType)
      return (
      <div key={`pathnodes${index}`} className={styles.pathNodeWrap}>
         <div className={styles.pathNode}>
          <div className={styles.pathBox}>
            <p className={styles.delete}>
              {this.state.pathNodes.length > 1 ? <Icon type="delete" onClick={this.remove(index)}/> : null}
            </p>
            <h4 className={styles.title}>
              {index + 1}
            </h4>
            <div
              style={{...formItemStyle}}
            >
              <Select
                defaultValue={`${node['widget']}`}
                placeholder="初始widget"
                style={{width: '100%'}}
                onChange={this.changeWidget(index)}
              >
                {widgetOptions}
              </Select>
            </div>
            <div
              style={{...formItemStyle}}
            >
              <Select
                placeholder="入参"
                style={{width: '100%'}}
                disabled={index === 0}
                defaultValue={node.enter}
                onChange={this.changeParams(index, 'enter', node.views)}
              >
                {paramOptions}
              </Select>
            </div>
            <div className={styles.errorMessage}>
              {node.enterErrorMessage && node.enterErrorMessage.length ? node.enterErrorMessage : ''}
            </div>
            <div
              style={{...formItemStyle}}
            >
              <Select
                placeholder="出参"
                style={{width: '100%'}}
                defaultValue={node.out}
                disabled={pathNodes.length > 0 && index === (pathNodes.length - 1)}
                onChange={this.changeParams(index, 'out', node.views)}
              >
                {paramOptions}
              </Select>
            </div>
            <div className={styles.errorMessage}>
              {node.outErrorMessage && node.outErrorMessage.length ? node.outErrorMessage : ''}
            </div>
          </div>
          <div className={styles.relation}>
            <div
              style={{margin: '0px'}}
            >
              <Select
                defaultValue={`=`}
                style={{width: '60px'}}
                onChange={this.changeParams(index, 'nextRelation')}
              >
                {relationOptions}
              </Select>
            </div>
          </div>
          </div>
      </div>
    )})
    const pathStyle = classnames({
      [utilStyles.hide]: this.state.pathOrFree !== 'path'
    })
    return (
      <div className={styles.drillPathSetting}>
        <div className={styles.drillStyle}>
          <b className={styles.label}>钻取模式: </b>
          <RadioGroup value={this.state.pathOrFree} onChange={this.onChange}>
            <Radio value={`free`} checked>自由钻取</Radio>
            <Radio value={`path`}>路径钻取</Radio>
          </RadioGroup>
        </div>
        <div className={pathStyle}>
          <div className={styles.path}>
            {pathDrill}
            <div className={styles.add}>
              <Button type="dashed" onClick={this.add} style={{ width: '60px', height: '60px' }}>
                <Icon type="plus"/>
              </Button>
            </div>
          </div>
          <div style={{height: '30px'}}/>
          {/* <div className={styles.footer}>
            {drillSettingButtons}
          </div> */}
        </div>
        <div className={styles.footer}>
            {drillSettingButtons}
          </div>
      </div>
    )
  }
}

export default DrillPathSetting

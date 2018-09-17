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
const Button = require('antd/lib/button')
const Modal = require('antd/lib/modal')

import { SQL_NUMBER_TYPES, DEFAULT_SPLITER } from '../../../globalConstants'
import { decodeMetricName, getAggregatorLocale } from '../../Widget/components/util'
import { IPivotProps, RenderType } from '../../Widget/components/Pivot/Pivot'
import LinkageConfig from 'components/Linkages/LinkageConfig'

const styles = require('../Dashboard.less')

interface IDashboardLinkageConfigProps {
  currentDashboard: any
  currentItems: any[]
  currentItemsInfo: any
  linkages: any[]
  views: any[]
  widgets: any[]
  visible: boolean
  loading: boolean
  onCancel: () => void
  onSave: (filterItems: any[]) => void
  onGetWidgetInfo: (itemId: number) => void
}

interface IDashboardLinkageConfigStates {
  linkageCascaderSource: any[]
  savingLinkageConfig: boolean
}

export class DashboardLinkageConfig extends React.Component<IDashboardLinkageConfigProps, IDashboardLinkageConfigStates> {

  public constructor (props: IDashboardLinkageConfigProps) {
    super(props)
    this.state = {
      linkageCascaderSource: [],
      savingLinkageConfig: false
    }
  }

  public componentWillReceiveProps (nextProps: IDashboardLinkageConfigProps) {
    const { visible } = nextProps
    if (visible) {
      const linkageCascaderSource = this.getLinkageConfigSource()
      this.setState({ linkageCascaderSource })
    }
  }

  private getLinkageConfigSource = () => {
    const { currentItems, widgets, views, currentItemsInfo } = this.props
    if (!currentItemsInfo) { return [] }
    const varReg = /query@var\s+\$(\w+)\$/g

    const linkageConfigSource = []
    Object.keys(currentItemsInfo).forEach((k) => {
      const dashboardItem = currentItems.find((ci) => `${ci.id}` === k)
      const widget = widgets.find((w) => w.id === dashboardItem.widgetId)
      const widgetConfig: IPivotProps = JSON.parse(widget.config)
      const { cols, rows, metrics } = widgetConfig

      const view = views.find((bl) => bl.id === widget.viewId)
      const { sql, model } = view
      const modelObj = JSON.parse(model)
      const variableArr = (sql.match(varReg) || []).map((qv) => qv.substring(qv.indexOf('$') + 1, qv.length - 1))

      // Cascader value 中带有 itemId、字段类型、参数/变量标识 这些信息，用 DEFAULT_SPLITER 分隔
      const params = [
        ...[...cols, ...rows].filter((key) => modelObj[key]).map((key) => ({
          label: key,
          value: [key, modelObj[key].sqlType, 'parameter'].join(DEFAULT_SPLITER)
        })),
        ...metrics.map(({ name, agg }) => ({
          label: `${getAggregatorLocale(agg)} ${decodeMetricName(name)}`,
          value: [name, SQL_NUMBER_TYPES[SQL_NUMBER_TYPES.length - 1], 'parameter'].join(DEFAULT_SPLITER)
        }))
      ]

      const variables = variableArr.map((val) => {
        return {
          label: `${val}[变量]`,
          value: [val, 'variable'].join(DEFAULT_SPLITER)
        }
      })

      linkageConfigSource.push({
        label: widget.name,
        value: k,
        children: {
          params,
          variables
        }
      })
    })

    return linkageConfigSource
  }

  private onSavingLinkageConfig = () => {
    this.setState({
      savingLinkageConfig: !this.state.savingLinkageConfig
    })
  }

  private cancel = () => {
    const { onCancel } = this.props
    Modal.confirm({
      content: '确认不保存当前联动关系配置吗？',
      onOk: onCancel,
      onCancel: void 0
    })
  }

  public render () {
    const { visible, loading, onSave, onGetWidgetInfo, linkages } = this.props
    const { linkageCascaderSource, savingLinkageConfig } = this.state

    const modalButtons = [(
      <Button
        key="cancel"
        size="large"
        onClick={this.cancel}
      >
        取 消
      </Button>
    ), (
      <Button
        key="submit"
        size="large"
        type="primary"
        loading={loading}
        disabled={loading}
        onClick={this.onSavingLinkageConfig}
      >
        保 存
      </Button>
    )]

    return (
      <Modal
        title="联动关系配置"
        wrapClassName="ant-modal-large"
        visible={visible}
        onCancel={this.cancel}
        footer={modalButtons}
      >
        <div className={styles.modalLinkageConfig}>
          <LinkageConfig
            linkages={linkages}
            cascaderSource={linkageCascaderSource}
            onGetWidgetInfo={onGetWidgetInfo}
            saving={savingLinkageConfig}
            onSave={onSave}
          />
        </div>
      </Modal>
    )
  }
}

export default DashboardLinkageConfig

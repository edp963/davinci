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

import FilterConfig from 'components/Filters/FilterConfig'

const styles = require('../Dashboard.less')

interface IDashboardFilterConfigProps {
  currentDashboard: any
  currentItems: any[]
  views: any[]
  widgets: any[]
  visible: boolean
  loading: boolean
  filterOptions: {
    [filterKey: string]: {
      [key: string]: Array<number | string>
    }
  }
  onCancel: () => void
  onSave: (filterItems: any[]) => void
  onGetOptions: (
    filterKey: string,
    fromViewId: string,
    fromModel: string,
    parents: Array<{ column: string, value: string }>
  ) => void
}

interface IDashboardFilterConfigStates {
  filters: any[]
  savingFilterConfig: boolean
}

export class DashboardFilterConfig extends React.Component<IDashboardFilterConfigProps, IDashboardFilterConfigStates> {

  public constructor (props: IDashboardFilterConfigProps) {
    super(props)
    this.state = {
      filters: [],
      savingFilterConfig: false
    }
  }

  public componentWillReceiveProps (nextProps: IDashboardFilterConfigProps) {
    const { currentDashboard, currentItems } = nextProps
    if (currentDashboard !== this.props.currentDashboard || currentItems !== this.props.currentItems) {
      this.adjustGlobalFilterTableSource(currentDashboard, currentItems)
    }
  }

  private adjustGlobalFilterTableSource = (currentDashboard, currentItems) => {
    if (!currentDashboard) { return [] }

    const config = JSON.parse(currentDashboard.config || '{}')
    const globalFilterTableSource = config.filters || []

    const filters =  globalFilterTableSource.map((gfts) => {
      const { relatedViews } = gfts
      let { items } = relatedViews
      if (items) {
        items = items.filter((itemId) => currentItems.findIndex((ci) => ci.id === itemId) >= 0)
      }
      return gfts
    })

    this.setState({ filters })
  }

  private onSavingFilterConfig = () => {
    this.setState({
      savingFilterConfig: !this.state.savingFilterConfig
    })
  }

  public render () {
    const { visible, loading, currentItems, widgets, views, onSave, onGetOptions, filterOptions, onCancel } = this.props
    const { filters, savingFilterConfig } = this.state

    if (!visible) { return null }

    const modalButtons = [(
      <Button
        key="cancel"
        size="large"
        onClick={onCancel}
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
        onClick={this.onSavingFilterConfig}
      >
        保 存
      </Button>
    )]

    return (
      <Modal
        wrapClassName="ant-modal-large"
        title="全局筛选配置"
        maskClosable={false}
        visible={visible}
        footer={modalButtons}
        onCancel={onCancel}
      >
        <div className={styles.modalFilterConfig}>
          <FilterConfig
            views={views}
            widgets={widgets}
            items={currentItems}
            filters={filters}
            saving={savingFilterConfig}
            onOk={onSave}
            onGetPreviewData={onGetOptions}
            previewData={filterOptions}
          />
        </div>
      </Modal>
    )
  }
}

export default DashboardFilterConfig

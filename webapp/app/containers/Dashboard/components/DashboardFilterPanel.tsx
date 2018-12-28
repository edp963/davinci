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
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
const utilStyles = require('assets/less/util.less')
import { MapFilterControlOptions, OnFilterValueChange } from 'components/Filters'
import FilterPanel from 'components/Filters/FilterPanel'

interface IDashboardFilterPanelProps {
  currentDashboard
  currentItems
  onGetOptions: (
    filterKey: string,
    fromViewId: string,
    fromModel: string,
    parents: Array<{ column: string, value: string }>
  ) => void
  mapOptions: MapFilterControlOptions,
  onChange: OnFilterValueChange
}

interface IDashboardFilterPanelStates {
  filters: any[]
}

export class DashboardFilterPanel extends React.Component<IDashboardFilterPanelProps, IDashboardFilterPanelStates> {

  public constructor (props: IDashboardFilterPanelProps) {
    super(props)
    this.state = {
      filters: []
    }
  }

  public componentWillReceiveProps (nextProps: IDashboardFilterPanelProps) {
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

  public render () {
    const { onGetOptions, mapOptions, onChange } = this.props
    const { filters } = this.state
    const globalFilterContainerClass = classnames({
      [utilStyles.hide]: !filters.length
    })

    return (
      <Row className={globalFilterContainerClass}>
        <Col span={24}>
          <FilterPanel
            filters={filters}
            onGetOptions={onGetOptions}
            mapOptions={mapOptions}
            onChange={onChange}
          />
        </Col>
      </Row>
    )
  }
}

export default DashboardFilterPanel

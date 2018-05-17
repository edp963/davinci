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

import TableChart from './TableChart'
import ScorecardChart from './ScorecardChart'
import TextChart from './TextChart'

import { TABLE_HEADER_HEIGHT, TABLE_PAGINATION_HEIGHT } from '../../../globalConstants'

interface IChartProps {
  id: string
  w: number
  h: number
  data: any
  loading: boolean
  chartInfo: any
  updateConfig: any
  chartParams: any
  updateParams: any[]
  classNames: any
  interactId: string
  onCheckTableInteract: (itemId: number) => object
  onDoTableInteract: (itemId: number, linkagers: any[], value: any) => void
  currentBizlogicId: number
  onTextEditorChange?: () => void
}

interface IChartStates {
  tableWidth: number
  tableHeight: number
  blockWidth: number
  blockHeight: number
}

export class Chart extends React.PureComponent<IChartProps, IChartStates> {
  constructor (props) {
    super(props)
    this.state = {
      tableWidth: 0,
      tableHeight: 0,
      blockWidth: 0,
      blockHeight: 0
    }
  }

  private block: HTMLDivElement = null

  public componentDidMount () {
    this.updateTableSize()
  }

  public componentDidUpdate () {
    this.updateTableSize()
  }

  private updateTableSize () {
    const { offsetWidth, offsetHeight } = this.block
    this.setState({
      tableWidth: offsetWidth,
      tableHeight: offsetHeight - TABLE_HEADER_HEIGHT - TABLE_PAGINATION_HEIGHT,
      blockWidth: offsetWidth,
      blockHeight: offsetHeight
    })
  }

  public render () {
    const {
      id,
      data,
      loading,
      chartInfo,
      updateConfig,
      chartParams,
      classNames,
      updateParams,
      interactId,
      onCheckTableInteract,
      onDoTableInteract,
      currentBizlogicId,
      onTextEditorChange
    } = this.props
    const {
      tableWidth,
      tableHeight,
      blockWidth,
      blockHeight
    } = this.state

    let chartContent
    if (chartInfo.renderer && chartInfo.renderer === 'echarts') {
      chartContent = (
        <div className={classNames.chart} id={`widget_${id}`} />
      )
    } else {
      switch (chartInfo.name) {
        case 'table':
          chartContent = (
            <TableChart
              id={id}
              className={classNames.table}
              data={data}
              loading={loading}
              chartParams={chartParams}
              updateConfig={updateConfig}
              updateParams={updateParams}
              currentBizlogicId={currentBizlogicId}
              width={tableWidth}
              height={tableHeight}
              interactId={interactId}
              onCheckInteract={onCheckTableInteract}
              onDoInteract={onDoTableInteract}
            />
          )
          break
        case 'scorecard':
          chartContent = (
            <ScorecardChart
              id={id}
              className={classNames.chart}
              data={data}
              loading={loading}
              chartParams={chartParams}
              width={blockWidth}
              height={blockHeight}
            />
          )
          break
        case 'text':
          chartContent = (
            <TextChart
              className={classNames.chart}
              data={data}
              loading={loading}
              editing={id === 'commonChart'}
              chartParams={chartParams}
              onTextEditorChange={onTextEditorChange}
            />
          )
          break
      }
    }

    return (
      <div className={classNames.container} ref={(f) => {this.block = f}}>
        {chartContent}
      </div>
    )
  }
}

export default Chart

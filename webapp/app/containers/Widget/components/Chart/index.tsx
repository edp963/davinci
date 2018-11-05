import * as React from 'react'
import { IWidgetProps } from '../Widget'
import Table from './Table'
import Scorecard from './Scorecard'
import Chart from './Chart'
import { getTable, getScorecard } from '../util'

export interface IChartProps extends IWidgetProps {
  width: number
  height: number
}

const tableId = getTable().id
const scorecardId = getScorecard().id

export function CombinedChart (props: IChartProps) {
  const {
    width,
    height,
    data,
    selectedChart
  } = props

  switch (selectedChart) {
    case tableId:
      return (
        <Table
          data={data}
          width={width}
          height={height}
        />
      )
    case scorecardId:
      return (
        <Scorecard {...props} />
      )
    default:
      return (
        <Chart {...props}/>
      )
  }
}

export default CombinedChart

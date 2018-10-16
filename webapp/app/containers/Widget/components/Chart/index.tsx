import * as React from 'react'
import { IWidgetProps } from '../Widget'
import Table from './Table'
import Chart from './Chart'
import { getTable } from '../util'

export interface IChartProps extends IWidgetProps {
  width: number
  height: number
}

export function CombinedChart (props: IChartProps) {
  const {
    width,
    height,
    data,
    selectedChart
  } = props

  if (selectedChart === getTable().id) {
    return (
      <Table
        data={data}
        width={width}
        height={height}
      />
    )
  } else {
    return (
      <Chart {...props}/>
    )
  }
}

export default CombinedChart

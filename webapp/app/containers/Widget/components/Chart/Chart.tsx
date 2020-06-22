import React, { useMemo, useEffect, useCallback, useState } from 'react'
import { IChartProps } from './index'
import chartlibs from '../../config/chart'
import echarts from 'echarts/lib/echarts'
import { ECharts } from 'echarts'
import chartOptionGenerator from '../../render/chart'
const styles = require('./Chart.less')

const Chart: React.FC<IChartProps> = (props) => {
  const {
    data,
    onError,
    renderType,
    isDrilling,
    onDoInteract,
    selectedChart,
    selectedItems,
    getDataDrillDetail,
    onSelectChartsItems,
    onCheckTableInteract
  } = props
  let container = useMemo<HTMLDivElement>(() => null, [])
  let instance = useMemo<ECharts>(() => null, [])
  const [seriesItems, setSItems] = useState<string[]>([])

  useEffect(() => {
    renderChart(props)
    return () => {
      if (instance) {
        instance.off('click')
      }
    }
  }, [props])

  const renderChart = useCallback(
    (props: IChartProps) => {
      if (renderType === 'loading') {
        return
      }
      if (!instance) {
        instance = echarts.init(container, 'default')
      } else {
        if (renderType === 'rerender') {
          instance.dispose()
          instance = echarts.init(container, 'default')
        }
        if (renderType === 'clear') {
          instance.clear()
        }
      }

      try {
        instance.off('click')
        instance.on('click', (params) => {
          collectSelectedItems(params)
        })

        instance.setOption(
          chartOptionGenerator(
            chartlibs.find((cl) => cl.id === selectedChart).name,
            props,
            {
              instance,
              isDrilling,
              getDataDrillDetail,
              selectedItems,
              callback: (seriesData) => {
                instance.off('click')
                instance.on('click', (params) => {
                  collectSelectedItems(params, seriesData)
                })
              }
            }
          )
        )
        instance.resize()
      } catch (error) {
        if (onError) {
          onError(error)
        }
      }
    },
    [
      onError,
      isDrilling,
      renderType,
      selectedChart,
      selectedItems,
      getDataDrillDetail
    ]
  )

  const collectSelectedItems = useCallback(
    (params, seriesData?) => {
      let selectedItems = []
      let series = []
      if (props.selectedItems && props.selectedItems.length) {
        selectedItems = [...props.selectedItems]
      }
      let dataIndex = params.dataIndex
      if (selectedChart === 4) {
        dataIndex = params.seriesIndex
      }
      if (selectedItems.length === 0) {
        selectedItems.push(dataIndex)
      } else {
        const isb = selectedItems.some((item) => item === dataIndex)
        if (isb) {
          for (let index = 0, l = selectedItems.length; index < l; index++) {
            if (selectedItems[index] === dataIndex) {
              selectedItems.splice(index, 1)
              break
            }
          }
        } else {
          selectedItems.push(dataIndex)
        }
      }

      if (seriesData) {
        const { seriesIndex, dataIndex } = params
        const char = `${seriesIndex}&${dataIndex}`
        if (seriesItems && Array.isArray(seriesItems)) {
          series = seriesItems.includes(char)
            ? seriesItems.filter((item) => item !== char)
            : seriesItems.concat(char)
          setSItems(() => series)
        }
      }
      const resultData = selectedItems.map((item, index) => {
        if (seriesData) {
          const seriesIndex = series[index] ? series[index].split('&')[0] : null
          return seriesData[seriesIndex] ? seriesData[seriesIndex][item] : []
        }
        return data[item]
      })
      const brushed = [{ 0: Object.values(resultData) }]
      const sourceData = Object.values(resultData)
      const isInteractiveChart = onCheckTableInteract && onCheckTableInteract()
      if (isInteractiveChart && onDoInteract) {
        const triggerData = sourceData
        onDoInteract(triggerData)
      }
      setTimeout(() => {
        if (getDataDrillDetail) {
          getDataDrillDetail(
            JSON.stringify({ range: null, brushed, sourceData })
          )
        }
      }, 500)
      if (onSelectChartsItems) {
        onSelectChartsItems(selectedItems)
      }
    },
    [
      data,
      seriesItems,
      onDoInteract,
      selectedChart,
      selectedItems,
      getDataDrillDetail,
      onSelectChartsItems,
      onCheckTableInteract
    ]
  )

  return <div className={styles.chartContainer} ref={(f) => (container = f)} />
}

export default Chart

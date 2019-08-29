import produce from 'immer'
import { IChartStyles } from 'app/containers/Widget/components/Widget'
import { IMigrationRecorder } from '.'
import barDefaultConfig from 'app/containers/Widget/config/chart/bar'
import { EmptyStack } from 'app/containers/Widget/components/Config/Stack/constants'

const barChartStyles: IMigrationRecorder<IChartStyles> = {
  versions: ['beta6'],
  recorder: {
    beta6 (chartStyle) {
      const { bar: barConfig, spec: barSpec } = chartStyle
      const {
        bar: defaultBarConfig
      } = barDefaultConfig.style as IChartStyles
      if (!barConfig) {
        const newBarConfig = produce(defaultBarConfig, (draft) => {
          draft.barChart = !!barSpec.barChart
          draft.stack.on = !!barSpec.stack
          draft.stack.percentage = barSpec.percentage
        })
        chartStyle.bar = newBarConfig
        return chartStyle
      }
      barConfig.barChart = !!barSpec.barChart
      const { stack } = barConfig
      if (!stack) {
        barConfig.stack = {
          ...EmptyStack,
          on: !!barSpec.stack,
          percentage: barSpec.percentage
        }
      }
      return chartStyle
    }
  }
}

export default barChartStyles

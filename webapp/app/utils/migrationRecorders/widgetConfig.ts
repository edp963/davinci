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

import controlMigrationRecorder from './control'
import { IMigrationRecorder } from '.'
import {
  IWidgetConfig,
  IChartStyles,
  IWidgetDimension
} from 'app/containers/Widget/components/Widget'
import barDefaultConfig from 'app/containers/Widget/config/chart/bar'
import { EmptyStack } from 'app/containers/Widget/components/Config/Stack/constants'
import {
  IFieldSortConfig,
  FieldSortTypes
} from 'app/containers/Widget/components/Config/Sort'
import ChartTypes from 'app/containers/Widget/config/chart/ChartTypes'
import { ControlQueryMode } from 'app/components/Control/constants'

interface IWidgetConfigMigrationRecorder extends IMigrationRecorder {
  recorders: {
    beta5(config: IWidgetConfig): IWidgetConfig
    beta6(config: IWidgetConfig): IWidgetConfig
    beta9(config: IWidgetConfig, options?): IWidgetConfig
  }
}

const widgetConfigMigrationRecorder: IWidgetConfigMigrationRecorder = {
  versions: ['beta5', 'beta6', 'beta9'],
  recorders: {
    beta5(config) {
      return {
        ...config,
        controls: config.controls.map((control) =>
          controlMigrationRecorder.beta5(control)
        )
      }
    },
    beta6(config) {
      const { mode, selectedChart } = config

      // bar chartStyles migration
      let chartStyles = { ...config.chartStyles }
      if (mode === 'chart' && selectedChart === ChartTypes.Bar) {
        const { bar: barConfig, spec: barSpec } = chartStyles
        const { bar: defaultBarConfig } = barDefaultConfig.style as IChartStyles
        if (!barConfig) {
          chartStyles = {
            ...chartStyles,
            bar: {
              ...defaultBarConfig,
              barChart: !!barSpec.barChart,
              stack: {
                ...defaultBarConfig.stack,
                on: !!barSpec.stack,
                percentage: barSpec.percentage
              }
            }
          }
        } else {
          if (!barConfig.stack) {
            chartStyles = {
              ...chartStyles,
              bar: {
                ...barConfig,
                stack: {
                  ...EmptyStack,
                  on: !!barSpec.stack,
                  percentage: barSpec.percentage
                }
              }
            }
          }
        }
      }

      // cols and rows migration
      const cols = config.cols.map((c) => beta6DimensionFix(c))
      const rows = config.rows.map((r) => beta6DimensionFix(r))

      // autoLoadData migration
      const autoLoadData =
        config.autoLoadData === void 0 ? true : config.autoLoadData

      return {
        ...config,
        chartStyles,
        cols,
        rows,
        autoLoadData
      }
    },
    beta9(config, options) {
      return {
        ...config,
        controls: config.controls.map((control) =>
          controlMigrationRecorder.beta9(control, options)
        ),
        queryMode:
          config.queryMode === void 0
            ? ControlQueryMode.Manually
            : config.queryMode,
        limit: config.limit === void 0 ? null : config.limit
      }
    }
  }
}

function beta6DimensionFix(dimension: IWidgetDimension): IWidgetDimension {
  const { sort } = dimension
  if (typeof sort === 'string') {
    const sortConfig: IFieldSortConfig = {
      sortType: sort as FieldSortTypes
    }
    return {
      ...dimension,
      sort: sortConfig
    }
  }
  return dimension
}

export default widgetConfigMigrationRecorder

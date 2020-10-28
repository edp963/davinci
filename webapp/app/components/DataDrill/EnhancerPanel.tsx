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
import utilStyles from 'app/assets/less/util.less'
import styles from './datadrill.less'
import { IDataDrillProps, IEnhancerPanel } from './types'
import DataDrill from './Panel'
import {
  DrillableChart,
  DrillableChartNeedNotFilter
} from 'containers/Widget/config/chart/DrillableChart'

function enhancePanel<T>() {
  return (WrapperComponent) => {
    class EnhancerPanel extends React.PureComponent<T & IEnhancerPanel, {}> {
      private isDrillableChart() {
        const { chartStyle } = this.props
        return DrillableChart.some((drillable) => drillable === chartStyle)
      }
      private isDrillableChartNeedNotFilter() {
        const { chartStyle } = this.props
        return DrillableChartNeedNotFilter.some(
          (drillable) => drillable === chartStyle
        )
      }
      private hide() {
        let isHide = true
        const { isSelectedGroup, isSelectedfilter } = this.props
        const isDrillableChart = this.isDrillableChart()
        const isDrillableChartNeedNotFilter = this.isDrillableChartNeedNotFilter()
        if (!isDrillableChart) {
          isHide = true
          return isHide
        }

        if (!(isSelectedfilter && isSelectedfilter.length === 0)) {
          isHide = false
          return isHide
        }

        if (!(isSelectedGroup && isSelectedGroup.length === 0)) {
          isHide = false
          return isHide
        }

        if (isDrillableChartNeedNotFilter) {
          isHide = false
          return isHide
        }

        return isHide
      }

      public render() {
        const dataDrillPanelClass = classnames({
          [styles.dataDrillPanel]: true,
          [utilStyles.hide]: this.hide()
        })

        return (
          <div className={dataDrillPanelClass}>
            <WrapperComponent {...this.props} />
          </div>
        )
      }
    }
    return EnhancerPanel
  }
}

export default enhancePanel<IDataDrillProps>()(DataDrill)

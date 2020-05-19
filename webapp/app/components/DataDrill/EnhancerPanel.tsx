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

function enhancePanel<T>() {
  return (WrapperComponent) => {
    class EnhancerPanel extends React.PureComponent<T & IEnhancerPanel, {}> {
      private hide() {
        let isHide = true
        const {
          isSelectedGroup,
          isDrillableChart,
          isSelectedfilter
        } = this.props
        if (!isDrillableChart) {
          isHide = true
          return isHide
        }

        if (isSelectedfilter) {
          isHide = false
          return isHide
        }

        if (isSelectedGroup) {
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

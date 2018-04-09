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

import React, { PureComponent } from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import Icon from 'antd/lib/icon'

import styles from '../Dashboard.less'

export class TextChart extends PureComponent {

  render () {
    const {
      id,
      // data,
      loading,
      className
      // chartParams
    } = this.props

    const textcard = loading
      ? (
        <div className={styles.scorecard}>
          <div className={styles.scorecardContainer}>
            <Icon type="loading" />
          </div>
        </div>
      )
      : (
        <div className={styles.scorecard}>
          <div className={styles.scorecardContainer}>

          </div>
        </div>
      )

    return (
      <div className={className} id={`widget_${id}`}>
        {textcard}
      </div>
    )
  }
}

TextChart.propTypes = {
  id: PropTypes.string,
  // data: PropTypes.object,
  loading: PropTypes.bool,
  className: PropTypes.string
  // chartParams: PropTypes.object
}

TextChart.defaultProps = {
  chartParams: {}
}

export function mapDispatchToProps (dispatch) {
  return {

  }
}

export default connect(null, mapDispatchToProps)(TextChart)

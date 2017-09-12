/*-
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

import React, { PropTypes } from 'react'
import classnames from 'classnames'

import utilStyles from '../../assets/less/util.less'
import styles from './SegmentControl.less'

export class SegmentPane extends React.Component {
  render () {
    const {
      active,
      children
    } = this.props

    const panelClass = classnames({
      [utilStyles.hide]: !active
    })

    return (
      <div className={`${styles.segmentPane} ${panelClass}`}>
        {children}
      </div>
    )
  }
}

SegmentPane.propTypes = {
  active: PropTypes.bool,
  children: PropTypes.any
}

export default SegmentPane

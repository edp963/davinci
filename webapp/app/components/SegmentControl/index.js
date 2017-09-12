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

import React, { PropTypes, cloneElement } from 'react'
import classnames from 'classnames'

import SegmentPane from './SegmentPane'

import styles from './SegmentControl.less'

export class SegmentControl extends React.Component {
  static SegmentPane = SegmentPane

  constructor (props) {
    super(props)
    this.state = {
      activeKey: ''
    }
  }

  componentWillMount () {
    const children = React.Children.toArray(this.props.children)
    if (children.length) {
      this.setState({
        activeKey: children[0].key
      })
    }
  }

  itemClick = (key) => () => {
    this.setState({
      activeKey: key
    })
    this.props.onChange(key)
  }

  render () {
    const {
      position
    } = this.props

    const {
      activeKey
    } = this.state

    const children = React.Children.toArray(this.props.children)

    const indicatorPosition = classnames({
      [styles.left]: position === 'left',
      [styles.right]: position === 'right'
    })

    const indicators = []
    const panes = []

    children.forEach(c => {
      let { key } = c
      let { tab, children } = c.props

      let indicatorClass = classnames({
        [styles.active]: key === activeKey
      })

      indicators.push(
        <li
          className={indicatorClass}
          key={key}
          onClick={this.itemClick(key)}
        >
          {tab || ''}
        </li>
      )

      panes.push(cloneElement(c, {
        active: c.key === activeKey,
        children: children
      }))
    })

    return (
      <div className={styles.segmentControl}>
        <ul className={`${styles.indicator} ${indicatorPosition}`}>
          {indicators}
        </ul>
        <div className={styles.segmentPanes}>
          {panes}
        </div>
      </div>
    )
  }
}

SegmentControl.propTypes = {
  // activeKey: PropTypes.string,
  // defaultActiveKey: PropTypes.string,
  position: PropTypes.string,
  onChange: PropTypes.func,
  // onClick: PropTypes.func,
  children: PropTypes.any
}

SegmentControl.defaultProps = {
  position: 'left',
  onChange: () => {}
}

export default SegmentControl

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

import styles from './Box.less'

export class Box extends React.Component {

  static Header = (props) => (
    <div className={styles.header}>
      {props.children}
    </div>
  )

  static Title = (props) => (
    <h3 className={styles.title}>
      {props.children}
    </h3>
  )

  static Tools = (props) => (
    <div className={styles.tools}>
      {props.children}
    </div>
  )

  static Body = (props) => (
    <div className={styles.body}>
      {props.children}
    </div>
  )

  render () {
    return (
      <div className={styles.box}>
        {this.props.children}
      </div>
    )
  }
}

Box.propTypes = {
  children: PropTypes.node
}

export default Box

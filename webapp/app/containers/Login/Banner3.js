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

import styles from './Login3.less'

export class Banner extends PureComponent {
  componentDidMount () {
    this.timeout = setTimeout(() => {
      this.refs.root.classList.add(styles.flap)
    }, 1000)
  }

  componentWillUnMount () {
    clearTimeout(this.timeout)
  }

  render () {
    return (
      <div className={styles.banner} ref="root">
        <div className={styles.layer1}>
          <div className={styles.bar}></div>
          <div className={styles.pie}></div>
          <div className={styles.line}></div>
          <div className={styles.table}></div>
        </div>
        <div className={styles.layer2}>
          <div className={styles.bar}></div>
          <div className={styles.pie}></div>
          <div className={styles.line}></div>
          <div className={styles.table}></div>
        </div>
        <div className={styles.layer3}>
          <div className={styles.table}>
            <table>
              <thead>
                <tr><th></th><th></th><th></th><th></th></tr>
              </thead>
              <tbody>
                <tr><td></td><td></td><td></td><td></td></tr>
                <tr><td></td><td></td><td></td><td></td></tr>
                <tr><td></td><td></td><td></td><td></td></tr>
                <tr><td></td><td></td><td></td><td></td></tr>
              </tbody>
            </table>
          </div>
          <div className={styles.bar}>
            <div className={styles.bar1} />
            <div className={styles.bar2} />
            <div className={styles.bar3} />
            <div className={styles.bar4} />
            <div className={styles.bar5} />
          </div>
          <div className={styles.pie}>
            <div className={styles.pie1} />
            <div className={styles.pie2} />
            <div className={styles.pie2Fix} />
          </div>
        </div>
      </div>
    )
  }
}

export default Banner

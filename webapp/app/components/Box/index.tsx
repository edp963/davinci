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

const styles = require('./Box.less')

interface IBoxProps {
  children: React.ReactNode
}

export class Box extends React.Component<IBoxProps, {}> {

  public static Header = (props) => (
    <div className={styles.header}>
      {props.children}
    </div>
  )

  public static Title = (props) => (
    <h3 className={styles.title}>
      {props.children}
    </h3>
  )

  public static Tools = (props) => (
    <div className={styles.tools}>
      {props.children}
    </div>
  )

  public static Body = (props) => (
    <div className={styles.body}>
      {props.children}
    </div>
  )

  public render () {
    return (
      <div className={styles.box}>
        {this.props.children}
      </div>
    )
  }
}

export default Box

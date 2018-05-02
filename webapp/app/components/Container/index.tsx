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

import * as React from 'react'
import * as classnames from 'classnames'

const styles = require('./Container.less')

interface IContainerProps {
  grid?: string
  card?: string
  children: React.ReactNode
}

export class Container extends React.Component<IContainerProps, {}> {
  public static Title = (props: IContainerProps) => (
    <div className={styles.title}>
      {props.children}
    </div>
  )

  public static Body = (props: IContainerProps) => {
    const bodyClass = classnames({
      [styles.body]: true,
      [styles.grid]: props.grid,
      [styles.card]: props.card
    })
    return (
      <div className={bodyClass}>
        {props.children}
      </div>
    )
  }

  public render () {
    return (
      <div className={styles.container}>
        {this.props.children}
      </div>
    )
  }
}

export default Container

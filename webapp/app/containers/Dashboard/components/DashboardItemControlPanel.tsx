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

const styles = require('../Dashboard.less')

interface IDashboardItemControlPanelProps {
  show: boolean
  children: React.ReactNode
}

export class DashboardItemControlPanel extends React.PureComponent<IDashboardItemControlPanelProps, {}> {
  public render () {
    const panelClass = classnames({
      [styles.controlPanel]: true,
      [styles.show]: this.props.show
    })

    const formClass = classnames({
      [styles.form]: true,
      [styles.show]: this.props.show
    })

    return (
      <div className={panelClass}>
        <div className={formClass}>
          {this.props.children}
        </div>
      </div>
    )
  }
}

export default DashboardItemControlPanel

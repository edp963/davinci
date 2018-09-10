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
import { Link } from 'react-router'

const styles = require('../Sidebar/Sidebar.less')


interface ISidebarOptionProps {
  route: any[]
  active: boolean
  children: React.ReactNode
  params: any
}

export class SidebarOption extends React.PureComponent <ISidebarOptionProps, {}> {
  public render () {
    const optionClass = classnames(
      { [styles.option]: true },
      { [styles.active]: this.props.active }
    )
   // const linkRoute = `/report/${this.props.route[0]}`
    const linkRoute = `/project/${this.props.params.pid}/${this.props.route[0]}`

    return (
      <div className={optionClass}>
        <Link to={linkRoute}>
          {this.props.children}
        </Link>
      </div>
    )
  }
}

export default SidebarOption

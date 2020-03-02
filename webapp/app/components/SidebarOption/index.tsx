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
import { Link } from 'react-router-dom'

import styles from '../Sidebar/Sidebar.less'

interface ISidebarOptionProps {
  indexRoute: string
  active: boolean
  projectId: number
  icon: React.ReactNode
}

const SidebarOption: React.FC<ISidebarOptionProps> = (props) => {
  const { indexRoute, active, projectId, icon } = props
  const optionClass = classnames(
    { [styles.option]: true },
    { [styles.active]: active }
  )
  const linkRoute = `/project/${projectId}/${indexRoute}`

  return (
    <div className={optionClass}>
      <Link to={linkRoute}>{icon}</Link>
    </div>
  )
}

export default React.memo(SidebarOption)

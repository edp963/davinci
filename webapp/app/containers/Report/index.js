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
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import classnames from 'classnames'

import Sidebar from '../../components/Sidebar'
import SidebarOption from '../../components/SidebarOption'
import { selectSidebar } from './selectors'
import { loadSidebar } from './actions'
import { makeSelectLoginUser } from '../App/selectors'
import styles from './Report.less'

export class Report extends React.Component {

  componentDidMount () {
    this.props.onPageLoad()
  }

  render () {
    const {
      sidebar,
      loginUser,
      routes
    } = this.props

    const sidebarOptions = sidebar && sidebar.map(item => {
      const isOptionActive = item.route.indexOf(routes[3].name) >= 0
      const iconClassName = `iconfont ${item.icon}`
      return (
        <SidebarOption
          key={item.route}
          route={item.route}
          active={isOptionActive}>
          <i className={iconClassName}></i>
        </SidebarOption>
      )
    })

    const sidebarComponent = loginUser.admin
      ? (
        <Sidebar>
          {sidebarOptions}
        </Sidebar>
      ) : ''

    const mainClass = classnames({
      [styles.main]: true,
      [styles.admin]: loginUser.admin
    })

    return (
      <div className={styles.report}>
        {sidebarComponent}
        <div className={mainClass}>
          {this.props.children}
        </div>
      </div>
    )
  }
}

Report.propTypes = {
  sidebar: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.bool
  ]),
  loginUser: PropTypes.object,
  onPageLoad: PropTypes.func,
  routes: PropTypes.array,
  children: PropTypes.node
}

const mapStateToProps = createStructuredSelector({
  sidebar: selectSidebar(),
  loginUser: makeSelectLoginUser()
})

export function mapDispatchToProps (dispatch) {
  return {
    onPageLoad: () => {
      const sidebarSource = [
        { icon: 'icon-dashboard', route: ['dashboard', 'grid'] },
        { icon: 'icon-widget-gallery', route: ['widget'] },
        { icon: 'icon-custom-business', route: ['bizlogic'] },
        { icon: 'icon-datasource24', route: ['source'] },
        { icon: 'icon-user1', route: ['user'] },
        { icon: 'icon-group', route: ['group'] }
      ]
      dispatch(loadSidebar(sidebarSource))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Report)

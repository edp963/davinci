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

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import Sidebar from '../../components/Sidebar'
import SidebarOption from '../../components/SidebarOption'
import { selectSidebar } from './selectors'
import { loadSidebar } from './actions'
import { makeSelectLoginUser } from '../App/selectors'
import { showNavigator } from '../App/actions'
import styles from './Report.less'

export class Report extends React.Component {

  componentDidMount () {
    this.props.onPageLoad()
    this.props.onShowNavigator()
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

    return (
      <div className={styles.report}>
        {sidebarComponent}
        <div className={styles.container}>
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
  routes: PropTypes.array,
  children: PropTypes.node,
  onPageLoad: PropTypes.func,
  onShowNavigator: PropTypes.func
}

const mapStateToProps = createStructuredSelector({
  sidebar: selectSidebar(),
  loginUser: makeSelectLoginUser()
})

export function mapDispatchToProps (dispatch) {
  return {
    onPageLoad: () => {
      const sidebarSource = [
        { icon: 'icon-dashboard', route: ['dashboards', 'dashboard', 'widgetPosition'] },
        { icon: 'icon-widget-gallery', route: ['widgets'] },
        { icon: 'icon-custom-business', route: ['bizlogics'] },
        { icon: 'icon-datasource24', route: ['sources'] },
        { icon: 'icon-user1', route: ['users'] },
        { icon: 'icon-group', route: ['groups'] },
        { icon: 'anticon anticon-clock-circle-o', route: ['schedule'] }
      ]
      dispatch(loadSidebar(sidebarSource))
    },
    onShowNavigator: () => dispatch(showNavigator())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Report)

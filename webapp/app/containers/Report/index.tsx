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
import { connect } from 'react-redux'
import { compose } from 'redux'
import { createStructuredSelector } from 'reselect'
import {InjectedRouter} from 'react-router/lib/Router'

import { Icon } from 'antd'
import { IProject } from '../Projects'
import Sidebar from 'components/Sidebar'
import SidebarOption from 'components/SidebarOption/index'
import { selectSidebar } from './selectors'
import { loadSidebar } from './actions'
import { makeSelectLoginUser } from '../App/selectors'
import { showNavigator } from '../App/actions'
import { loadProjectDetail, killProjectDetail } from '../Projects/actions'
import { loadProjectRoles } from '../Organizations/actions'
import reducer from '../Projects/reducer'
import injectReducer from 'utils/injectReducer'
import saga from '../Projects/sagas'
import injectSaga from 'utils/injectSaga'
import { makeSelectCurrentProject } from '../Projects/selectors'

import MenuPermission from '../Account/components/checkMenuPermission'
import { hasOnlyVizPermission } from '../Account/components/checkUtilPermission'
const styles = require('./Report.less')

interface IReportProps {
  router: InjectedRouter
  sidebar: boolean | IsidebarDetail[]
  loginUser: { admin: boolean }
  routes: any[]
  params: any
  children: React.ReactNode
  currentProject: IProject
  onPageLoad: () => any
  onShowNavigator: () => any
  onLoadProjectDetail: (id: number) => any
  onKillProjectDetail: () => any
  onLoadProjectRoles: (id: number) => any
}

interface IsidebarDetail {
  icon?: React.ReactNode
  route?: string[]
  permission?: string
}

interface IReportStates {
  isPermissioned: boolean
}

export class Report extends React.Component<IReportProps, IReportStates> {
  public constructor (props) {
    super(props)
    this.state = {
      isPermissioned: false
    }
  }

  public componentDidMount () {
    const { pid } = this.props.params
    this.props.onPageLoad()
    this.props.onShowNavigator()
    if (pid) {
      this.props.onLoadProjectDetail(pid)
      this.props.onLoadProjectRoles(pid)
    }
  }

  public indexRoute = (projectDetail: IProject) => {
    const { routes, params } = this.props
    const { permission } = projectDetail
    const whichModuleHasPermission = Object.entries(permission).map(([k, v]) => k !== 'projectId' && typeof v === 'number' && v ? k : void 0).filter((a) => a)
    if (routes.length === 3 && routes[routes.length - 1]['name'] === 'project') {
      if (whichModuleHasPermission.some((p) => p === 'vizPermission')) {
        this.props.router.replace(`/project/${params.pid}/vizs`)
        return
      }
      if (whichModuleHasPermission && whichModuleHasPermission.length > 0) {
        const path = whichModuleHasPermission[0].slice(0, -10)
        this.props.router.replace(`/project/${params.pid}/${path}${path === 'schedule' ? '' : 's'}`)
      }
    }
  }

  public componentWillReceiveProps (nextProps) {
    const {location, currentProject} = nextProps
    let permission = void 0
    if (location && currentProject && currentProject.permission) {
      this.indexRoute(currentProject)
      const projectPermission = currentProject.permission
      for (const attr in projectPermission) {
        if (attr) {
          const pathname = location.pathname
          const pStr = attr.slice(0, -10)
          if (pathname.indexOf(pStr) > 0) {
            permission = projectPermission[attr]
          } else if (pathname.indexOf('views') > 0 && pathname.replace('views', 'view').indexOf(pStr) > 0) {
            permission = projectPermission[attr]
          }
        }
      }

      if (permission === 0) {
        this.props.router.replace(`/noAuthorization`)
      }
      this.setState({
        isPermissioned: true
      })
    }
  }
  public componentWillUnmount () {
    this.props.onKillProjectDetail()
  }
  public render () {
    const {
      isPermissioned
    } = this.state

    const {
      sidebar,
      routes,
      currentProject
    } = this.props
    const sidebarOptions = isPermissioned && sidebar && (sidebar as IsidebarDetail[]).map((item) => {
      const isOptionActive = item.route.indexOf(routes && routes[3] ? routes[3]['name'] : '') >= 0
      const ProviderSidebar = MenuPermission(currentProject, item.permission)(SidebarOption)

      return (
        <ProviderSidebar
          key={item.permission}
          route={item.route}
          active={isOptionActive}
          params={this.props.params}
        >
          {item.icon}
        </ProviderSidebar>
      )
    })

    const sidebarComponent = currentProject
      && currentProject.permission
      && !hasOnlyVizPermission(currentProject.permission)
        ? (
          <Sidebar>
            {sidebarOptions}
          </Sidebar>
        ) : ''

    const reportView = isPermissioned ? (
      <div className={styles.report}>
        {sidebarComponent}
        <div className={styles.container}>
          {this.props.children}
        </div>
      </div>
    ) : []

    return reportView
  }
}

const mapStateToProps = createStructuredSelector({
  sidebar: selectSidebar(),
  loginUser: makeSelectLoginUser(),
  currentProject: makeSelectCurrentProject()
})

export function mapDispatchToProps (dispatch) {
  return {
    onPageLoad: () => {
      const sidebarSource = [
        { icon: (<i className="iconfont icon-dashboard" />), route: ['vizs', 'dashboard'], permission: 'viz' },
        { icon: (<i className="iconfont icon-widget-gallery" />), route: ['widgets'], permission: 'widget' },
        { icon: (<i className="iconfont icon-custom-business" />), route: ['views', 'view'], permission: 'view' },
        { icon: (<i className="iconfont icon-datasource24" />), route: ['sources'], permission: 'source' },
        { icon: (<Icon type="clock-circle" />), route: ['schedule'], permission: 'schedule' }
      ]
      dispatch(loadSidebar(sidebarSource))
    },
    onLoadProjectDetail: (id) => dispatch(loadProjectDetail(id)),
    onShowNavigator: () => dispatch(showNavigator()),
    onKillProjectDetail: () => dispatch(killProjectDetail()),
    onLoadProjectRoles: (id) => dispatch(loadProjectRoles(id))
  }
}

const withReducer = injectReducer({ key: 'project', reducer })
const withSaga = injectSaga({ key: 'project', saga })
const withConnect = connect(mapStateToProps, mapDispatchToProps)

export default compose(
  withReducer,
  withSaga,
  withConnect
)(Report)

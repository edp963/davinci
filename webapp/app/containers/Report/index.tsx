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
import { Route, withRouter, Redirect } from 'react-router-dom'
import { createStructuredSelector } from 'reselect'

import { Icon } from 'antd'
import { IProject } from '../Projects/types'
import Sidebar from 'components/Sidebar'
import SidebarOption from 'components/SidebarOption/index'
import { SidebarPermissions } from './constants'
import { selectSidebar } from './selectors'
import { loadSidebar } from './actions'
import { makeSelectLoginUser } from '../App/selectors'
import { showNavigator } from '../App/actions'
import { ProjectActions } from '../Projects/actions'
const { loadProjectDetail, killProjectDetail } = ProjectActions
import { OrganizationActions } from '../Organizations/actions'
const { loadProjectRoles } = OrganizationActions
import reducer from '../Projects/reducer'
import injectReducer from 'utils/injectReducer'
import saga from '../Projects/sagas'
import injectSaga from 'utils/injectSaga'
import { makeSelectCurrentProject } from '../Projects/selectors'

import MenuPermission from '../Account/components/checkMenuPermission'
import { hasOnlyVizPermission } from '../Account/components/checkUtilPermission'
const styles = require('./Report.less')

import { RouteComponentWithParams } from 'utils/types'

interface IReportProps {
  sidebar: boolean | IsidebarDetail[]
  loginUser: { admin: boolean }
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

export class Report extends React.Component<IReportProps & RouteComponentWithParams, IReportStates> {
  public constructor (props) {
    super(props)
    this.state = {
      isPermissioned: false
    }
  }

  public componentDidMount () {
    const { projectId } = this.props.match.params
    this.props.onPageLoad()
    this.props.onShowNavigator()
    if (projectId) {
      this.props.onLoadProjectDetail(+projectId)
      this.props.onLoadProjectRoles(+projectId)
    }
  }

  public indexRoute = (projectDetail: IProject) => {
    const { location, match } = this.props
    const { id: projectId, permission } = projectDetail
    const whichModuleHasPermission = Object.entries(permission).map(([k, v]) => k !== 'projectId' && typeof v === 'number' && v ? k : void 0).filter((a) => a)
    if (location.pathname.endsWith(`/project/${projectId}`)) {
      if (whichModuleHasPermission.some((p) => p === 'vizPermission')) {
        this.props.history.replace(`/project/${match.params.projectId}/vizs`)
        return
      }

      SidebarPermissions.some((sidebarPermission) => {
        if (whichModuleHasPermission.includes(sidebarPermission)) {
          const path = sidebarPermission.slice(0, -10)
          this.props.history.replace(`/project/${match.params.projectId}/${path}s`)
          return true
        }
      })
    }
  }

  public componentWillReceiveProps (nextProps: IReportProps & RouteComponentWithParams) {
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
        this.props.history.replace(`/noAuthorization`)
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
      location,
      match,
      currentProject
    } = this.props
    const locationName = location.pathname.substr(location.pathname.lastIndexOf('/') + 1)
    const sidebarOptions = isPermissioned && sidebar && (sidebar as IsidebarDetail[]).map((item) => {
      const isOptionActive = item.route.some((route) => route.includes(locationName))
      const ProviderSidebar = MenuPermission(currentProject, item.permission)(SidebarOption)

      return (
        <ProviderSidebar
          key={item.permission}
          indexRoute={item.route[0]}
          active={isOptionActive}
          projectId={match.params.projectId}
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
        { icon: (<Icon type="clock-circle" />), route: ['schedules', 'schedule'], permission: 'schedule' }
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
  withConnect,
  withRouter
)(Report)

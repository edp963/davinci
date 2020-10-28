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
import { connect } from 'react-redux'
import { Route, Switch, Redirect } from 'react-router-dom'
import AuthorizedRoute from './AuthorizedRoute'
import { RouteComponentWithParams } from 'utils/types'
import { createStructuredSelector } from 'reselect'

import Navigator from 'components/Navigator'

import { logged, logout, loadDownloadList } from '../App/actions'
import { makeSelectLogged, makeSelectNavigator, makeSelectOauth2Enabled } from '../App/selectors'
import { DOWNLOAD_LIST_POLLING_FREQUENCY, EXTERNAL_LOG_OUT_URL } from 'app/globalConstants'

import { Project, ProjectList } from 'containers/Projects/Loadable'

import { Sidebar } from './Loadable'
import Viz from 'containers/Viz/Loadable'
import { Widget, Workbench } from 'containers/Widget/Loadable'
import { View, ViewEditor } from 'containers/View/Loadable'
import { Source } from 'containers/Source/Loadable'
import { Schedule, ScheduleEditor } from 'containers/Schedule/Loadable'

import { Dashboard } from 'containers/Dashboard/Loadable'

import { Account } from 'containers/Account/Loadable'
import { Profile, UserProfile } from 'containers/Profile/Loadable'
import { ResetPassword } from 'containers/ResetPassword/Loadable'
import {
  OrganizationList,
  Organization
} from 'containers/Organizations/Loadable'
import { NoAuthorization } from 'containers/NoAuthorization/Loadable'

const styles = require('./Main.less')

type MappedStates = ReturnType<typeof mapStateToProps>
type MappedDispatches = ReturnType<typeof mapDispatchToProps>
type IMainProps = MappedStates & MappedDispatches & RouteComponentWithParams

export class Main extends React.Component<IMainProps, {}> {
  private downloadListPollingTimer: number

  constructor(props: IMainProps & RouteComponentWithParams) {
    super(props)
    this.initPolling()
  }

  public componentWillUnmount() {
    if (this.downloadListPollingTimer) {
      clearInterval(this.downloadListPollingTimer)
    }
  }

  private initPolling = () => {
    this.props.onLoadDownloadList()
    this.downloadListPollingTimer = window.setInterval(() => {
      this.props.onLoadDownloadList()
    }, DOWNLOAD_LIST_POLLING_FREQUENCY)
  }

  private logout = () => {
    const { history, oauth2Enabled, onLogout } = this.props
    onLogout()
    if (oauth2Enabled) {
      history.replace(EXTERNAL_LOG_OUT_URL)
    } else {
      history.replace('/login')
    }
  }

  private renderAccount = () => (
    <Account>
      <Switch>
        <Redirect from="/account" exact to="/account/profile" />
        <Route path="/account/profile" component={Profile} />
        <Route path="/account/profile/:userId" component={UserProfile} />
        <Route path="/account/resetPassword" component={ResetPassword} />
        <Route path="/account/organizations" component={OrganizationList} />
        <Route
          path="/account/organization/:organizationId"
          component={Organization}
        />
      </Switch>
    </Account>
  )

  public render() {
    const { logged, navigator } = this.props

    return logged ? (
      <div className={styles.container}>
        <Navigator show={navigator} onLogout={this.logout} />
        <Switch>
          <Route path="/project(s?)">
            <Switch>
              <Route path="/projects" exact component={ProjectList} />
              <Route path="/project/:projectId">
                <Project>
                  <Switch>
                    <Route
                      path="/project/:projectId/portal/:portalId"
                      component={Dashboard}
                    />
                    <Route
                      path="/project/:projectId/display/:displayId"
                      component={Viz}
                    />
                    <Route
                      exact
                      path="/project/:projectId/widget/:widgetId?"
                      component={Workbench}
                    />
                    <Route
                      exact
                      path="/project/:projectId/view/:viewId?"
                      component={ViewEditor}
                    />
                    <Route
                      exact
                      path="/project/:projectId/schedule/:scheduleId?"
                      component={ScheduleEditor}
                    />
                    <Sidebar>
                      <Switch>
                        <AuthorizedRoute
                          permission="vizPermission"
                          path="/project/:projectId/vizs"
                          component={Viz}
                        />
                        <AuthorizedRoute
                          permission="widgetPermission"
                          path="/project/:projectId/widgets"
                          component={Widget}
                        />
                        <AuthorizedRoute
                          exact
                          permission="viewPermission"
                          path="/project/:projectId/views"
                          component={View}
                        />
                        <AuthorizedRoute
                          permission="sourcePermission"
                          path="/project/:projectId/sources"
                          component={Source}
                        />
                        <AuthorizedRoute
                          permission="schedulePermission"
                          path="/project/:projectId/schedules"
                          component={Schedule}
                        />
                      </Switch>
                    </Sidebar>
                  </Switch>
                </Project>
              </Route>
            </Switch>
          </Route>
          <Route path="/account" render={this.renderAccount} />
          <Route path="/noAuthorization" component={NoAuthorization} />
          <Redirect to="/projects" />
        </Switch>
      </div>
    ) : (
      <div />
    )
  }
}

const mapStateToProps = createStructuredSelector({
  logged: makeSelectLogged(),
  oauth2Enabled: makeSelectOauth2Enabled(),
  navigator: makeSelectNavigator()
})

export function mapDispatchToProps(dispatch) {
  return {
    onLogged: (user) => dispatch(logged(user)),
    onLogout: () => dispatch(logout()),
    onLoadDownloadList: () => dispatch(loadDownloadList())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Main)

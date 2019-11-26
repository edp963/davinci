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
import { Route, HashRouter as Router, Switch, Redirect } from 'react-router-dom'
import { RouteComponentWithParams } from 'utils/types'
import { createStructuredSelector } from 'reselect'

import Navigator from 'components/Navigator'

import { logged, logout, getLoginUser, loadDownloadList, showNavigator, hideNavigator } from '../App/actions'
import { makeSelectLogged, makeSelectNavigator } from '../App/selectors'
import checkLogin from 'utils/checkLogin'
import { setToken } from 'utils/request'
import { DOWNLOAD_LIST_POLLING_FREQUENCY } from 'app/globalConstants'

import { Project } from 'containers/Projects/Loadable'

import { Report } from 'containers/Report/Loadable'
import { Viz } from 'containers/Viz/Loadable'
import { Widget, Workbench } from 'containers/Widget/Loadable'
import { View, ViewEditor } from 'containers/View/Loadable'
import { Source } from 'containers/Source/Loadable'
import { Schedule, ScheduleEditor } from 'containers/Schedule/Loadable'

import { Dashboard } from 'containers/Dashboard/Loadable'
import { DisplayEditor, DisplayPreview } from 'containers/Display/Loadable'
import { Account } from 'containers/Account/Loadable'
import { Profile, UserProfile } from 'containers/Profile/Loadable'
import { ResetPassword } from 'containers/ResetPassword/Loadable'
import { OrganizationList, Organization } from 'containers/Organizations/Loadable'
import { NoAuthorization } from 'containers/NoAuthorization/Loadable'

const styles = require('./Main.less')

interface IMainProps {
  logged: boolean
  navigator: boolean
  onLogged: (user) => void
  onLogout: () => void
  onGetLoginUser: (resolve: () => void) => any
  onLoadDownloadList: () => void
}

export class Main extends React.Component<IMainProps & RouteComponentWithParams, {}> {

  private downloadListPollingTimer: number

  constructor (props: IMainProps & RouteComponentWithParams) {
    super(props)
    this.initPolling()
  }

  public componentWillUnmount () {
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
    const { history, onLogout } = this.props
    onLogout()
    history.replace('/login')
  }

  private renderReport = () => (
    <Report>
      <Router>
        <Switch>
          <Route path="/project/:projectId/vizs" component={Viz} />
          <Route path="/project/:projectId/widgets" component={Widget} />
          <Route exact path="/project/:projectId/views" component={View} />
          <Route path="/project/:projectId/sources" component={Source} />
          <Route path="/project/:projectId/schedules" component={Schedule} />
        </Switch>
      </Router>
    </Report>
  )

  private renderAccount = () => (
    <Account>
      <Router>
        <Switch>
          <Redirect from="/account" exact to="/account/profile" />
          <Route path="/account/profile" component={Profile} />
          <Route path="/account/profile/:userId" component={UserProfile} />
          <Route path="/account/resetPassword" component={ResetPassword} />
          <Route path="/account/organizations" component={OrganizationList} />
          <Route path="/account/organization/:organizationId" component={Organization} />
        </Switch>
      </Router>
    </Account>
  )

  public render () {
    const { logged, navigator } = this.props

    return logged
      ? (
        <div className={styles.container}>
          <Navigator
            show={navigator}
            onLogout={this.logout}
          />
          <Router>
            <Switch>
              <Route path="/project/:projectId/portal/:portalId" component={Dashboard} />
              <Route exact path="/project/:projectId/display/:displayId" component={DisplayEditor} />
              <Route exact path="/project/:projectId/display/preview/:displayId" component={DisplayPreview} />
              <Route exact path="/project/:projectId/widget/:widgetId" component={Workbench} />
              <Route exact path="/project/:projectId/view/:viewId?" component={ViewEditor} />
              <Route exact path="/project/:projectId/schedule/:scheduleId?" component={ScheduleEditor} />

              <Route path="/projects/" component={Project} />
              <Route path="/project/:projectId" render={this.renderReport} />
              <Route path="/account" render={this.renderAccount} />
              <Route path="/noAuthorization" component={NoAuthorization} />
              <Redirect to="/projects" />
            </Switch>
          </Router>
        </div>
      )
      : (
        <div />
      )
  }
}

const mapStateToProps = createStructuredSelector({
  logged: makeSelectLogged(),
  navigator: makeSelectNavigator()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLogged: (user) => dispatch(logged(user)),
    onLogout: () => dispatch(logout()),
    onGetLoginUser: (resolve) => dispatch(getLoginUser(resolve)),
    onLoadDownloadList: () => dispatch(loadDownloadList())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Main)

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

import React, { useCallback } from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Route, HashRouter as Router, Switch, Redirect, withRouter } from 'react-router-dom'
import { RouteComponentWithParams } from 'utils/types'

import { compose } from 'redux'
import { logged, logout, getLoginUser } from './actions'
import injectSaga from 'utils/injectSaga'
import saga from './sagas'

import { makeSelectLogged } from './selectors'

import checkLogin from 'utils/checkLogin'
import { setToken } from 'utils/request'
import { statistic } from 'utils/statistic/statistic.dv'

import { Background } from 'containers/Background/Loadable'
import { Main } from 'containers/Main/Loadable'
import { Activate } from 'containers/Register/Loadable'

interface IAppStateProps {
  logged: boolean
}

interface IAppDispatchProps {
  onLogged: (user) => void
  onLogout: () => void
  onGetLoginUser: (resolve: () => void) => any
}

type AppProps = IAppStateProps & IAppDispatchProps & RouteComponentWithParams

export class App extends React.PureComponent<AppProps> {

  constructor (props: AppProps) {
    super(props)
    this.checkTokenLink()
  }

  private getQs = () => {
    const search = location.search
    const qs = search ? search.substr(1) : ''
    if (qs) {
      return qs
        .split('&')
        .reduce((rdc, val) => {
          const pair = val.split('=')
          rdc[pair[0]] = pair[1]
          return rdc
        }, {})
    } else {
      return false
    }
  }

  private checkTokenLink = () => {
    const {
      history,
      onGetLoginUser
    } = this.props

    const qs = this.getQs()
    const token = qs['usertoken']
    // TODO allow take other parameters
    // const dashboard = qs['dashboard']

    // @FIXME login with token from url query
    // if (token) {
    //   setToken(token)
    //   // onGetLoginUser(() => {
    //     history.replace('/projects')
    //     // if (dashboard) {
    //     //   router.replace(`/project/${this.props.params.projectId}/dashboard/${dashboard}`)
    //     // } else {

    //     // }
    //   // })
    // } else {
    this.checkNormalLogin()
    // }
  }

  private checkNormalLogin = () => {
    if (checkLogin()) {
      const token = localStorage.getItem('TOKEN')
      const loginUser = localStorage.getItem('loginUser')
      setToken(token)
      this.props.onLogged(JSON.parse(loginUser))
      statistic.sendPrevDurationRecord()
    } else {
      this.props.onLogout()
      // this.props.history.replace('/login')
    }
  }

  private renderRoute = () => {
    const { logged } = this.props

    return (
      logged ? (
        <Redirect to="/projects" />
      ) : (
        <Redirect to="/login" />
      )
    )
  }

  public render () {
    const { logged } = this.props
    if (typeof logged !== 'boolean') { return null }

    return (
      <div>
        <Helmet
          titleTemplate="%s - Davinci"
          defaultTitle="Davinci Web Application"
          meta={[
            {
              name: 'description',
              content: 'Davinci web application built for data visualization'
            }
          ]}
        />
        <Router>
          <Switch>
            <Route path="/activate" component={Activate} />
            <Route path="/joinOrganization" exact component={Background} />
            <Route path="/" exact render={this.renderRoute} />
            <Route path="/" component={logged ? Main : Background} />
          </Switch>
        </Router>
      </div>
    )
  }
}

const withSaga = injectSaga({ key: 'global', saga })

const mapStateToProps = createStructuredSelector({
  logged: makeSelectLogged()
})

const mapDispatchToProps = (dispatch) => ({
  onLogged: (user) => dispatch(logged(user)),
  onLogout: () => dispatch(logout()),
  onGetLoginUser: (resolve) => dispatch(getLoginUser(resolve))
})

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps
)

export default compose(
  withSaga,
  withConnect
)(App)

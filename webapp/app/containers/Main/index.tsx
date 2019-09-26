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
import { createStructuredSelector } from 'reselect'

import Navigator from 'components/Navigator'

import { logged, logout, getLoginUser, loadDownloadList } from '../App/actions'
import { makeSelectLogged, makeSelectNavigator } from '../App/selectors'
import checkLogin from 'utils/checkLogin'
import { setToken } from 'utils/request'
import { DOWNLOAD_LIST_POLLING_FREQUENCY } from 'app/globalConstants'
import { statistic } from 'utils/statistic/statistic.dv'
const styles = require('./Main.less')

interface IMainProps {
  params: {pid?: number}
  children: React.ReactNode
  router: any
  logged: boolean
  navigator: boolean
  onLogged: (user) => void
  onLogout: () => void
  onGetLoginUser: (resolve: () => void) => any
  onLoadDownloadList: () => void
}

export class Main extends React.Component<IMainProps, {}> {

  private downloadListPollingTimer: number

  public componentWillMount () {
    this.checkTokenLink()
  }

  public componentWillUnmount () {
    if (this.downloadListPollingTimer) {
      clearInterval(this.downloadListPollingTimer)
    }
  }

  private checkTokenLink = () => {
    const {
      router,
      onGetLoginUser
    } = this.props

    const qs = this.getQs()
    const token = qs['token']
    // TODO allow take other parameters
    // const dashboard = qs['dashboard']

    if (token) {
      setToken(token)
      onGetLoginUser(() => {
        router.replace('/projects')
        // if (dashboard) {
        //   router.replace(`/project/${this.props.params.pid}/dashboard/${dashboard}`)
        // } else {

        // }
      })
      this.initPolling()
    } else {
      this.checkNormalLogin()
    }
  }

  private checkNormalLogin = () => {
    if (checkLogin()) {
      const token = localStorage.getItem('TOKEN')
      const loginUser = localStorage.getItem('loginUser')
      setToken(token)
      this.props.onLogged(JSON.parse(loginUser))
      statistic.sendPrevDurationRecord()
      this.initPolling()
    } else {
      this.props.router.replace('/login')
    }
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

  private initPolling = () => {
    this.props.onLoadDownloadList()
    this.downloadListPollingTimer = window.setInterval(() => {
      this.props.onLoadDownloadList()
    }, DOWNLOAD_LIST_POLLING_FREQUENCY)
  }

  private logout = () => {
    const { router, onLogout } = this.props
    onLogout()
    router.replace('/login')
  }

  public render () {
    const { logged, navigator, children } = this.props

    return logged
      ? (
        <div className={styles.container}>
          <Navigator
            show={navigator}
            onLogout={this.logout}
          />
          {children}
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

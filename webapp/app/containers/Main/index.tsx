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

import Navigator from '../../components/Navigator'

import { logged, logout, setLoginUser, getLoginUser } from '../App/actions'
import { makeSelectLogged, makeSelectNavigator } from '../App/selectors'
import { promiseDispatcher } from '../../utils/reduxPromisation'
import checkLogin from '../../utils/checkLogin'
import { setToken } from '../../utils/request'

const styles = require('./Main.less')

interface IMainProps {
  params: {pid?: number}
  children: React.ReactNode
  router: any
  logged: boolean
  navigator: boolean
  onLogged: () => any
  onLogout: () => any
  onSetLoginUser: (user: object) => any
  onGetLoginUser: (resolve: () => void) => any
}

export class Main extends React.Component<IMainProps, {}> {
  public componentWillMount () {
    this.checkTokenLink()
  }

  private checkTokenLink = () => {
    const {
      router,
      onGetLoginUser
    } = this.props

    const qs = this.getQs()
    const token = qs['token']
    const dashboard = qs['dashboard']

    if (token) {
      setToken(token)
      localStorage.setItem('TOKEN', token)
      localStorage.setItem('TOKEN_EXPIRE', `${new Date().getTime() + 3600000}`)
      onGetLoginUser(() => {
        if (dashboard) {
          //router.replace(`/report/dashboard/${dashboard}`)
          router.replace(`/project/${this.props.params.pid}/dashboard/${dashboard}`)
        } else {
          //router.replace('/report')
          router.replace('/projects')
        }
      })
    } else {
      this.checkNormalLogin()
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

  private checkNormalLogin = () => {
    if (checkLogin()) {
      const token = localStorage.getItem('TOKEN')
      const loginUser = localStorage.getItem('loginUser')
      setToken(token)
      this.props.onLogged()
      this.props.onSetLoginUser(JSON.parse(loginUser))
    } else {
      this.props.router.replace('/login')
    }
  }

  private logout = () => {
    const {
      router,
      onLogout
    } = this.props
    onLogout()
    localStorage.removeItem('TOKEN')
    localStorage.removeItem('TOKEN_EXPIRE')
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
    onLogged: () => promiseDispatcher(dispatch, logged),
    onLogout: () => promiseDispatcher(dispatch, logout),
    onSetLoginUser: (user) => promiseDispatcher(dispatch, setLoginUser, user),
    onGetLoginUser: (resolve) => dispatch(getLoginUser(resolve))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Main)

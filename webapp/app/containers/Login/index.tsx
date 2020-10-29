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

import React, { ChangeEvent, FormEvent } from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { RouteComponentProps } from 'react-router-dom'

import LoginForm from './LoginForm'

import { compose } from 'redux'

import { login, logged } from '../App/actions'
import {
  makeSelectLoginLoading,
  makeSelectOauth2Enabled
} from '../App/selectors'
import checkLogin from 'utils/checkLogin'
import { setToken } from 'utils/request'
import { statistic } from 'utils/statistic/statistic.dv'
import ExternalLogin from '../ExternalLogin'

const styles = require('./Login.less')

type MappedStates = ReturnType<typeof mapStateToProps>
type MappedDispatches = ReturnType<typeof mapDispatchToProps>
type ILoginProps = MappedStates & MappedDispatches

interface ILoginStates {
  username: string
  password: string
}

export class Login extends React.PureComponent<
  ILoginProps & RouteComponentProps,
  ILoginStates
> {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: ''
    }
  }

  public componentWillMount() {
    this.checkNormalLogin()
  }

  private checkNormalLogin = () => {
    if (checkLogin()) {
      const token = localStorage.getItem('TOKEN')
      const loginUser = localStorage.getItem('loginUser')
      setToken(token)
      this.props.onLogged(JSON.parse(loginUser))
      this.props.history.replace('/')
    }
  }

  private findPassword = () => {
    const { history } = this.props
    history.push('/findPassword')
  }

  private changeUsername = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      username: e.target.value.trim()
    })
  }

  private changePassword = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      password: e.target.value
    })
  }

  private toSignUp = () => {
    const { history } = this.props
    history.replace('/register')
  }

  private doLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const { onLogin, history } = this.props
    const { username, password } = this.state

    if (username && password) {
      onLogin(username, password, () => {
        history.replace('/')
        statistic.whenSendTerminal()
        statistic.setOperations(
          {
            create_time: statistic.getCurrentDateTime()
          },
          (data) => {
            const loginRecord = {
              ...data,
              action: 'login'
            }
            statistic.sendOperation(loginRecord)
          }
        )
      })
    }
  }

  public render() {
    const { loginLoading, oauth2Enabled } = this.props
    const { username, password } = this.state
    return (
      <div className={styles.window}>
        <Helmet title="Login" />
        <LoginForm
          username={username}
          password={password}
          loading={loginLoading}
          onChangeUsername={this.changeUsername}
          onChangePassword={this.changePassword}
          onLogin={this.doLogin}
        />
        <p className={styles.tips}>
          <a
            href="javascript:;"
            className={styles.register}
            onClick={this.toSignUp}
          >
            注册新账户
          </a>
          <a
            href="javascript:;"
            className={styles.forgetPassword}
            onClick={this.findPassword}
          >
            忘记密码？
          </a>
        </p>
        {oauth2Enabled && <ExternalLogin />}
      </div>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  loginLoading: makeSelectLoginLoading(),
  oauth2Enabled: makeSelectOauth2Enabled()
})

export function mapDispatchToProps(dispatch) {
  return {
    onLogin: (username: string, password: string, resolve: () => void) =>
      dispatch(login(username, password, resolve)),
    onLogged: (user) => dispatch(logged(user))
  }
}

const withConnect = connect<{}, {}, ILoginProps>(
  mapStateToProps,
  mapDispatchToProps
)

export default compose(withConnect)(Login)

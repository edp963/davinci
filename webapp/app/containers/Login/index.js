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

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import Background from './Background'
import LoginForm from './LoginForm'
import Icon from 'antd/lib/icon'

import { login, logged, setLoginUser } from '../App/actions'
import { makeSelectLoginLoading } from '../App/selectors'
import { promiseDispatcher } from '../../utils/reduxPromisation'
import checkLogin from '../../utils/checkLogin'
import { setToken } from '../../utils/request'

import styles from './Login.less'

export class Login extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      username: '',
      password: ''
    }
  }

  componentWillMount () {
    this.checkNormalLogin()
  }

  checkNormalLogin = () => {
    if (checkLogin()) {
      const token = localStorage.getItem('TOKEN')
      const loginUser = localStorage.getItem('loginUser')

      setToken(token)
      this.props.onLogged()
      this.props.onSetLoginUser(JSON.parse(loginUser))
      this.props.router.replace('/')
    }
  }

  changeUsername = (e) => {
    this.setState({
      username: e.target.value.trim()
    })
  }

  changePassword = (e) => {
    this.setState({
      password: e.target.value
    })
  }

  doLogin = () => {
    const { onLogin, router } = this.props
    const { username, password } = this.state

    if (username && password) {
      onLogin(username, password, () => { router.replace('/') })
    }
  }

  render () {
    const { loginLoading } = this.props
    const { username, password } = this.state
    return (
      <div className={styles.login}>
        <Helmet title="Login" />
        <Background />
        <img className={styles.logo} src={require('../../assets/images/logo_light.svg')} />
        <div className={styles.window}>
          <LoginForm
            username={username}
            password={password}
            onChangeUsername={this.changeUsername}
            onChangePassword={this.changePassword}
            onLogin={this.doLogin}
          />
          <button
            disabled={loginLoading}
            onClick={this.doLogin}
          >
            {
              loginLoading
                ? <Icon type="loading" />
                : ''
            }
            登 录
          </button>
        </div>
      </div>
    )
  }
}

Login.propTypes = {
  router: PropTypes.any,
  loginLoading: PropTypes.bool,
  onLogin: PropTypes.func,
  onLogged: PropTypes.func,
  onSetLoginUser: PropTypes.func
}

const mapStateToProps = createStructuredSelector({
  loginLoading: makeSelectLoginLoading()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLogin: (username, password, resolve) => dispatch(login(username, password, resolve)),
    onLogged: () => promiseDispatcher(dispatch, logged),
    onSetLoginUser: (user) => promiseDispatcher(dispatch, setLoginUser, user)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)


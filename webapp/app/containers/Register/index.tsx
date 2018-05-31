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
import Helmet from 'react-helmet'
import { createStructuredSelector } from 'reselect'

import Background from '../Login/Background'
const Icon = require('antd/lib/icon')
import RegisterForm from '../Register/RegisterForm'
// import checkLogin from '../../utils/checkLogin'
// import { setToken } from '../../utils/request'
const styles = require('../Login/Login.less')
import { signup, checkNameAction } from '../App/actions'
import { makeSelectSignupLoading } from '../App/selectors'

interface IRegisterProps {
  router: any
  onSignup: (username: string, password: string, resolve?: (res: any) => any) => any
  onCheckName: (id: number, name: string, type: string, resolve?: (res: any) => any, reject?: (error: any) => any) => any
}

interface IRegisterStates {
  username: string
  password: string
  password2: string
}


export class Register extends React.PureComponent<IRegisterProps, IRegisterStates> {
  constructor (props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      password2: ''
    }
  }

  private changeUsername = (e) => {
    this.setState({
      username: e.target.value.trim()
    })
  }

  private changePassword = (e) => {
    this.setState({
      password: e.target.value.trim()
    })
  }

  private changePassword2 = (e) => {
    this.setState({
      password2: e.target.value.trim()
    })
  }

  public signUp = () => {
    const { onSignup } = this.props
    const { username, password} = this.state
    if (username && password) {
      onSignup(username, password, (res) => {
        console.log(res)
        // this.props.router.replace('/activate')
      })
    }
  }

  public render () {
    const signupLoading = true
    const { onCheckName } = this.props
    return (
      <div className={styles.login}>
        <Helmet title="Register" />
        <Background />
        <img className={styles.logo} src={require('../../assets/images/logo_light.svg')} />
        <div className={styles.window}>
          <RegisterForm
            username={this.state.username}
            password={this.state.password}
            password2={this.state.password2}
            onChangeUsername={this.changeUsername}
            onChangePassword={this.changePassword}
            onChangePassword2={this.changePassword2}
            onCheckName={onCheckName}
            onSignup={this.signUp}
          />
          <button
            disabled={signupLoading}
            onClick={this.signUp}
          >
            {
              signupLoading
                ? <Icon type="loading" />
                : ''
            }
            注册
          </button>
        </div>
      </div>
    )
  }
}




const mapStateToProps = createStructuredSelector({
  signupLoading: makeSelectSignupLoading()
})

export function mapDispatchToProps (dispatch) {
  return {
    onSignup: (username, password, resolve) => dispatch(signup(username, password, resolve)),
    onCheckName: (id, name, type, resolve, reject) => dispatch(checkNameAction(id, name, type, resolve, reject))
  }
}

export default connect<{}, {}, IRegisterProps>(mapStateToProps, mapDispatchToProps)(Register)


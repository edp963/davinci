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

import { compose } from 'redux'
import injectReducer from '../../utils/injectReducer'
import injectSaga from '../../utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'

import Background from '../Login/Background'
const Icon = require('antd/lib/icon')
const Message = require('antd/lib/message')
import RegisterForm from './RegisterForm'
import SendEmailTips from './SendEmailTips'
const styles = require('../Login/Login.less')
import { checkNameAction } from '../App/actions'
import { signup, sendMailAgain } from './actions'
import { makeSelectSignupLoading } from './selectors'
import {InjectedRouter} from 'react-router/lib/Router'

interface IRegisterProps {
  router: InjectedRouter
  onSendEmailOnceMore: (email: string, resolve?: (res: any) => any) => any
  onSignup: (username: string, email: string, password: string, resolve?: (res: any) => any) => any
  onCheckName: (id: number, name: string, type: string, resolve?: (res: any) => any, reject?: (error: any) => any) => any
}

interface IRegisterStates {
  step: string
  username: string
  email: string
  password: string
  password2: string
}


export class Register extends React.PureComponent<IRegisterProps, IRegisterStates> {
  constructor (props) {
    super(props)
    this.state = {
      step: 'first',
      username: '',
      email: '',
      password: '',
      password2: ''
    }
  }

  private changeUsername = (e) => {
    this.setState({
      username: e.target.value.trim()
    })
  }

  private onChangeEmail = (e) => {
    this.setState({
      email: e.target.value.trim()
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

  private signUp = () => {
    const { onSignup } = this.props
    const { username, email, password} = this.state
    if (username && password && email) {
      onSignup(username, email, password, () => {
        this.setState({
          step: 'second'
        })
      })
    }
  }

  private goBack = () => {
    this.setState({
      step: 'first'
    })
  }

  private toLogin = () => {
    const { router } = this.props
    router.replace('/login')
  }

  private sendEmailOnceMore = () => {
    const { onSendEmailOnceMore } = this.props
    const { email } = this.state
    onSendEmailOnceMore(email,  (res) => {
      Message.success(res)
    })
  }

  public render () {
    const signupLoading = false
    const { step, email } = this.state
    const { onCheckName } = this.props
    const firstStep = (
        <div className={styles.window}>
          <RegisterForm
            username={this.state.username}
            email={this.state.email}
            password={this.state.password}
            password2={this.state.password2}
            onChangeUsername={this.changeUsername}
            onChangeEmail={this.onChangeEmail}
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
          <p className={styles.tips}>
            <span>已有davinci账号， </span>
            <a href="javascript:;" onClick={this.toLogin}>点击登录</a>
          </p>
        </div>
      )
    const secondStep = (
        <div className={styles.window}>
            <SendEmailTips
              email={email}
              goBack={this.goBack}
              sendEmailOnceMore={this.sendEmailOnceMore}
            />
        </div>
      )

    return (
      <div className={styles.login}>
        <Helmet title="Register" />
        <Background />
        <img className={styles.logo} src={require('../../assets/images/logo_light.svg')} />
        {
          step === 'first' ? firstStep : secondStep
        }
      </div>
    )
  }
}




const mapStateToProps = createStructuredSelector({
  signupLoading: makeSelectSignupLoading()
})

export function mapDispatchToProps (dispatch) {
  return {
    onSignup: (username, email, password, resolve) => dispatch(signup(username, email, password, resolve)),
    onCheckName: (id, name, type, resolve, reject) => dispatch(checkNameAction(id, name, type, resolve, reject)),
    onSendEmailOnceMore: (email, resolve) => dispatch(sendMailAgain(email, resolve))
  }
}

const withConnect = connect<{}, {}, IRegisterProps>(mapStateToProps, mapDispatchToProps)
const withReducer = injectReducer({ key: 'global', reducer })
const withSaga = injectSaga({ key: 'global', saga })

export default compose(
  withReducer,
  withSaga,
  withConnect
)(Register)




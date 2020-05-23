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
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'

import { Icon, message } from 'antd'
import RegisterForm from './RegisterForm'
import SendEmailTips from './SendEmailTips'
const styles = require('../Login/Login.less')
import { checkNameAction } from '../App/actions'
import { signup, sendMailAgain } from './actions'
import { makeSelectSignupLoading } from './selectors'
import { RouteComponentProps } from 'react-router-dom'

interface IRegisterProps {
  signupLoading: boolean
  onSendEmailOnceMore: (email: string, resolve?: (res: any) => any) => any
  onSignup: (username: string, email: string, password: string, resolve?: (res: any) => any) => any
  onCheckName: (id: number, name: string, type: string, param?: any, resolve?: (res: any) => any, reject?: (error: any) => any) => any
}

interface IRegisterStates {
  step: string
  username: string
  email: string
  password: string
  password2: string
}


export class Register extends React.PureComponent<IRegisterProps & RouteComponentProps, IRegisterStates> {
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
    const { username, email, password, password2} = this.state
    const emailRep = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/
    if (username && password && email && password2) {
      if (!emailRep.test(email)) {
        message.error('无效的邮箱地址')
        return
      }
      if (password.length < 6 || password.length > 20) {
        message.error('密码长度为6-20位')
        return
      }
      if (password !== password2) {
        message.error('两次输入的密码不一致')
        return
      }
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
    const { history } = this.props
    history.replace('/login')
  }

  private sendEmailOnceMore = () => {
    const { onSendEmailOnceMore } = this.props
    const { email } = this.state
    onSendEmailOnceMore(email,  (res) => {
      message.success(res)
    })
  }

  public render () {
    const { step, email } = this.state
    const { onCheckName, signupLoading} = this.props
    const firstStep = (
        <div className={styles.window}>
          <Helmet title="Register" />
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
          <Helmet title="Register" />
          <SendEmailTips
            email={email}
            goBack={this.goBack}
            sendEmailOnceMore={this.sendEmailOnceMore}
          />
        </div>
      )

    return step === 'first' ? firstStep : secondStep
  }
}




const mapStateToProps = createStructuredSelector({
  signupLoading: makeSelectSignupLoading()
})

export function mapDispatchToProps (dispatch) {
  return {
    onSignup: (username, email, password, resolve) => dispatch(signup(username, email, password, resolve)),
    onCheckName: (id, name, type, params, resolve, reject) => dispatch(checkNameAction(id, name, type, params, resolve, reject)),
    onSendEmailOnceMore: (email, resolve) => dispatch(sendMailAgain(email, resolve))
  }
}

const withConnect = connect<{}, {}, IRegisterProps>(mapStateToProps, mapDispatchToProps)
const withReducer = injectReducer({ key: 'register', reducer })
const withSaga = injectSaga({ key: 'register', saga })

export default compose(
  withReducer,
  withSaga,
  withConnect
)(Register)




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

import { Icon } from 'antd'

const styles = require('./Login.less')

interface ILoginFormProps {
  username: string
  password: string
  onChangeUsername: (e: any) => any
  onChangePassword: (e: any) => any
  onLogin: () => any
}

export class LoginForm extends React.PureComponent<ILoginFormProps, {}> {
  constructor (props) {
    super(props)
  }

  private enterLogin: (e: KeyboardEvent) => any = null

  public componentWillUnmount () {
    this.unbindDocumentKeypress()
  }

  private bindDocumentKeypress = () => {
    this.enterLogin = (e) => {
      if (e.keyCode === 13) {
        this.props.onLogin()
      }
    }

    document.addEventListener('keypress', this.enterLogin, false)
  }

  private unbindDocumentKeypress = () => {
    document.removeEventListener('keypress', this.enterLogin, false)
    this.enterLogin = null
  }

  public render () {
    const {
      username,
      password,
      onChangeUsername,
      onChangePassword
    } = this.props

    return (
      <div className={styles.form}>
        <div className={styles.input}>
          <Icon type="user" />
          <input
            placeholder="用户名"
            value={username}
            onFocus={this.bindDocumentKeypress}
            onBlur={this.unbindDocumentKeypress}
            onChange={onChangeUsername}
          />
        </div>
        <div className={styles.input}>
          <Icon type="unlock" />
          <input
            placeholder="密码"
            type="password"
            value={password}
            onFocus={this.bindDocumentKeypress}
            onBlur={this.unbindDocumentKeypress}
            onChange={onChangePassword}
          />
        </div>
      </div>
    )
  }
}

export default LoginForm

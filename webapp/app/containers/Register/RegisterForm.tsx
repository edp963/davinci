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

import React, { FC, ChangeEvent, FormEvent } from 'react'
import { Icon } from 'antd'
import styles from '../Login/Login.less'

interface IRegisterFormProps {
  username: string
  email: string
  password: string
  password2: string
  loading: boolean
  onChangeUsername: (e: ChangeEvent<HTMLInputElement>) => void
  onChangeEmail: (e: ChangeEvent<HTMLInputElement>) => void
  onChangePassword: (e: ChangeEvent<HTMLInputElement>) => void
  onChangePassword2: (e: ChangeEvent<HTMLInputElement>) => void
  onSignup: (e: FormEvent<HTMLFormElement>) => void
  onCheckName: (
    id: number,
    name: string,
    type: string,
    resolve?: (res: any) => any,
    reject?: (error: any) => any
  ) => any
}

const RegisterForm: FC<IRegisterFormProps> = ({
  username,
  email,
  password,
  password2,
  loading,
  onChangeUsername,
  onChangeEmail,
  onChangePassword,
  onChangePassword2,
  onSignup
}) => {
  return (
    <form className={styles.form} onSubmit={onSignup}>
      <div className={styles.input}>
        <Icon type="user" />
        <input
          placeholder="用户名"
          value={username}
          onChange={onChangeUsername}
        />
      </div>
      <div className={styles.input}>
        <Icon type="mail" />
        <input placeholder="邮箱" value={email} onChange={onChangeEmail} />
      </div>
      <div className={styles.input}>
        <Icon type="unlock" />
        <input
          placeholder="密码"
          type="password"
          value={password}
          onChange={onChangePassword}
        />
      </div>
      <div className={styles.input}>
        <Icon type="unlock" />
        <input
          placeholder="确认密码"
          type="password"
          value={password2}
          onChange={onChangePassword2}
        />
      </div>
      <button type="submit" className={styles.submit} disabled={loading}>
        {loading ? <Icon type="loading" /> : ''}
        注册
      </button>
    </form>
  )
}

export default RegisterForm

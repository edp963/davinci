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
import styles from './Login.less'

interface ILoginFormProps {
  username: string
  password: string
  loading: boolean
  onChangeUsername: (e: ChangeEvent<HTMLInputElement>) => void
  onChangePassword: (e: ChangeEvent<HTMLInputElement>) => void
  onLogin: (e: FormEvent<HTMLFormElement>) => void
}

const LoginForm: FC<ILoginFormProps> = ({
  username,
  password,
  loading,
  onChangeUsername,
  onChangePassword,
  onLogin
}) => {
  return (
    <form className={styles.form} onSubmit={onLogin}>
      <div className={styles.input}>
        <Icon type="user" />
        <input
          placeholder="用户名"
          value={username}
          onChange={onChangeUsername}
        />
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
      <button type="submit" className={styles.submit} disabled={loading}>
        {loading ? <Icon type="loading" /> : ''}登 录
      </button>
    </form>
  )
}

export default LoginForm

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

import React, {
  ChangeEvent,
  FormEvent,
  FC,
  useState,
  useEffect,
  useCallback
} from 'react'
import { Icon } from 'antd'
import Background from 'share/components/Background'
import styles from 'share/components/Background/index.less'

interface ILoginPawwordProps {
  loading: boolean
  onCheck: (password: string) => void
}


const Password: FC<ILoginPawwordProps> = ({ loading, onCheck }) => {
  const [password, setPwd] = useState<string>()

  const onChangePassword = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setPwd(e.target.value.trim())
    },
    [password]
  )

  const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onCheck(password)
  }, [password])

  return (
    <Background>
      <form className={styles.forms} onSubmit={onSubmit}>
        <div className={styles.inputs}>
          <Icon type="unlock" />
          <input
            placeholder="请输入口令"
            type="text"
            value={password}
            onChange={onChangePassword}
          />
        </div>

        <button type="submit" className={styles.submits} disabled={loading}>
          {loading ? <Icon type="loading" /> : ''}确 定
        </button>
      </form>
    </Background>
  )
}

export default Password

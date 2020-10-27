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

import React, { memo, useMemo, useState, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useInjectReducer } from 'utils/injectReducer'
import { useInjectSaga } from 'utils/injectSaga'
import { ActionTypes } from './constants'
import { AppActions } from './actions'
import { makeSelectShareType, makeSelectPermissionLoading } from './selectors'
import Password from 'share/components/Password'
import Login from 'share/components/Login'
import {
  querystring,
  isAuthPassword,
  localStorageCRUD,
  removeNoAuthedPassword,
  getExpirationTime
} from '../../util'
import reducer from './reducer'
import saga from './sagas'
import { Tmode } from 'app/components/SharePanel/types'
import { message } from 'antd'
import { makeSelectLoginLoading } from '../App/selectors'

const Interceptor: React.FC<any> = (props) => {
  useInjectReducer({ key: 'global', reducer })
  useInjectSaga({ key: 'global', saga })
  const dispatch = useDispatch()
  const shareType: Tmode = useSelector(makeSelectShareType())
  const loading: boolean = useSelector(makeSelectPermissionLoading())
  const loginLoading: boolean = useSelector(makeSelectLoginLoading())

  const { shareToken } = useMemo(
    () => querystring(window.location.search.substr(1)),
    [window.location.search]
  )

  const [authPassword, setAuthPwd] = useState<boolean>(() => {
    const shareTokenObj = localStorageCRUD(
      ActionTypes.PASSWORD_SHARE_TOKENS
    ).retrieve(shareToken)
    return isAuthPassword(shareTokenObj)
  })

  const [islegitimate, setLegitimate] = useState<boolean>(false)

  const CheckPassword = useCallback(
    (password: string) => {
      dispatch(
        AppActions.getPermissions(
          shareToken,
          password,
          () => {
            setAuthPwd(true)
            localStorageCRUD(ActionTypes.PASSWORD_SHARE_TOKENS).update(
              shareToken,
              {
                password,
                expire: getExpirationTime(7)
              }
            )
          },
          () => {
            return message.error('口令输入错误')
          }
        )
      )
    },
    [shareToken]
  )

  const afterLogin = useCallback(() => {
    setLegitimate(true)
    dispatch(AppActions.getPermissions(shareToken))
  }, [islegitimate])

  const content = useMemo(() => {
    if (shareType && shareType.length) {
      if (shareType === 'PASSWORD' && !authPassword) {
        return <Password onCheck={CheckPassword} loading={loading} />
      }
      if (shareType === 'AUTH' && !islegitimate) {
        return (
          <Login
            loading={loginLoading}
            shareToken={shareToken}
            loginCallback={afterLogin}
          />
        )
      }
      return <>{props.children}</>
    }
    return <></>
  }, [shareType, authPassword, islegitimate])

  useEffect(() => {
    // delete expire token
    removeNoAuthedPassword(ActionTypes.PASSWORD_SHARE_TOKENS)
  }, [])

  return content
}

export default memo(Interceptor)

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

import { uuid } from 'utils/util'
import { message } from 'antd'
import { IPasswordShareToken, IToken } from './types'
import { ActionTypes as AppActions } from 'share/containers/App/constants'

export function getShareClientId(): string {
  let shareClientId = ''
  try {
    shareClientId = localStorage.getItem('SHARE_CLIENT_ID')
    if (!shareClientId) {
      shareClientId = uuid(32)
      localStorage.setItem('SHARE_CLIENT_ID', shareClientId)
    }
  } catch (err) {
    message.error(`获取分享页客户端ID失败：${err.message}`)
  }
  return shareClientId
}

export function isAuthPassword(passwordShareTokens: IToken | -1) {
  let bool: boolean = false
  if (passwordShareTokens === -1) {
    return bool
  } else {
    const { expire } = passwordShareTokens
    bool = !isExpire(expire)
  }
  return bool
}

export function getExpirationTime(
  days: number,
  startTime: number = new Date().getTime()
): number {
  const day2Timestamp = 60 * 60 * 24 * 1000
  return startTime + days * day2Timestamp
}

export function isExpire(deadline: number): boolean {
  const now = new Date().getTime()
  return !!(now > deadline)
}

export function deserialization(str: string) {
  if (!(str && str.length)) {
    return {}
  }
  let obj: object = {}
  try {
    obj = JSON.parse(str)
  } catch (error) {
    throw new Error('this string can not be deserialization')
  }
  return obj
}

export function serialization(target: object) {
  if (isInvalidObj(target)) {
    throw new Error('this object can not be serialization')
  }
  let str: string = ''
  try {
    str = JSON.stringify(target)
  } catch (error) {
    throw new Error('this object can not be serialization')
  }
  return str
}

function isInvalidObj(target) {
  return [null, undefined, 'null', '', 'undefined'].includes(target)
}

export function localStorageCRUD(keys: string) {
  const tokens = localStorage.getItem(keys)
  const tokenObj = deserialization(tokens)

  function save(value: IPasswordShareToken) {
    if (isInvalidObj(value)) {
      return
    }
    const ser = serialization(value)
    localStorage.setItem(keys, ser)
  }

  function retrieve(token: string) {
    return tokenObj[token] ? tokenObj[token] : -1
  }

  function update(token: string, tokenValue: IToken) {
    const newValue = {
      ...tokenObj,
      [token]: tokenValue
    }
    save(newValue)
  }

  function deleted(token: string) {
    const newValue = {
      ...tokenObj
    }
    delete newValue[token]
    save(newValue)
  }

  function getAll() {
    return tokenObj
  }

  return {
    retrieve,
    update,
    deleted,
    getAll
  }
}

export function removeNoAuthedPassword(localStorageKey: string) {
  const { getAll, deleted } = localStorageCRUD(localStorageKey)
  Object.entries(getAll()).forEach(([key, value]) => {
    const isAuthPwd = isAuthPassword(value)
    if (!isAuthPwd) {
      deleted(key)
    }
  })
}

export function getPasswordUrl (shareType: string, token: string, url: string) {
  const tokenDetail = localStorageCRUD(AppActions.PASSWORD_SHARE_TOKENS).retrieve(token)

  let requestUrl = url
  if (shareType === 'PASSWORD' && tokenDetail) {
    const { password } = tokenDetail
    requestUrl = `${requestUrl}?password=${password}`
  }
  return requestUrl
}

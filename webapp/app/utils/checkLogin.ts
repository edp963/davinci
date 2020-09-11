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

import request, { removeToken, setToken } from 'utils/request'
import api from 'utils/api'

function getLocalStorageByItem(key: string) {
  try {
    return localStorage.getItem(key)
  } catch (error) {
    return new Error(error)
  }
}

function setLocalStorageByItem(key: string, value) {
  try {
    return localStorage.setItem(key, value)
  } catch (error) {
    return new Error(error)
  }
}

function isValidToken() {
  const token = getLocalStorageByItem('TOKEN')
  const loginUser = getLocalStorageByItem('loginUser')
  if (!loginUser) {
    return false
  }
  if (token) {
    const expire = getLocalStorageByItem('TOKEN_EXPIRE')
    const timestamp = new Date().getTime()

    if (Number(expire) > timestamp) {
      if (typeof token === 'string') {
        setToken(token)
      }
      return true
    } else {
      removeToken()
      return false
    }
  } else {
    return false
  }
}

function checkLogin(pathname, resolve?, reject?) {
  const status = isValidToken()
  if (status) {
    return resolve()
  }
  if (pathname !== '/login') {
    return reject()
  }
  return
}

async function getUserByToken(userToken, resolve, reject) {
  const result: any = await request(`${api.user}/check/${userToken}`, {})
  const loginUser = result.payload
  if (loginUser) {
    setLocalStorageByItem('loginUser', JSON.stringify(loginUser))
    setLocalStorageByItem('USER_TOKEN', userToken)
    return resolve(loginUser)
  } else {
    return reject()
  }
}

export function checkLoginStatus(
  userToken?: string,
  pathname?: string,
  resolve?,
  reject?
) {
  const userTokenInStorage = getLocalStorageByItem('USER_TOKEN')
  if (userToken && userToken.length) {
    if (userToken === userTokenInStorage) {
      return checkLogin(pathname, resolve, reject)
    } else {
      return getUserByToken(userToken, resolve, reject)
    }
  } else {
    return checkLogin(pathname, resolve, reject)
  }
}


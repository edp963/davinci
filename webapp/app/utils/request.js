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

import axios from 'axios'
import message from 'antd/lib/message'
// import { notifyError } from './util'

axios.defaults.validateStatus = function (status) {
  return status < 500
}

function parseJSON (response) {
  return response.data
}

function refreshToken (response) {
  const token = response.data.header.token
  if (token) {
    setToken(token)
    localStorage.setItem('TOKEN', token)
    localStorage.setItem('TOKEN_EXPIRE', new Date().getTime() + 3600000)
  }
  return response
}

function checkStatus (response) {
  switch (response.status) {
    case 401:
      message.error('未登录或会话过期，请重新登录', 5)
      removeToken()
      localStorage.removeItem('token')
      break
    default:
      break
  }
  return response
}

export default function request (url, options) {
  return axios(url, options)
    .then(checkStatus)
    .then(refreshToken)
    .then(parseJSON)
}

export function setToken (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export function removeToken () {
  delete axios.defaults.headers.common['Authorization']
}

export function getToken () {
  return  axios.defaults.headers.common['Authorization']
}

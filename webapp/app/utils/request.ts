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

import axios, { AxiosRequestConfig, AxiosResponse, AxiosPromise } from 'axios'
import { DEFAULT_JWT_TOKEN_EXPIRED } from 'app/globalConstants'

let tokenExpired = DEFAULT_JWT_TOKEN_EXPIRED

axios.defaults.validateStatus = function (status) {
  return status < 400
}

function parseJSON (response: AxiosResponse) {
  return response.data
}

function refreshToken (response: AxiosResponse) {
  const token = response.data.header && response.data.header.token
  if (token) {
    setToken(token)
  }
  return response
}

export function request (url: string, options?: AxiosRequestConfig): AxiosPromise<IDavinciResponse<object>>
export function request (config: AxiosRequestConfig): AxiosPromise<IDavinciResponse<object>>
export default function request (url: string | AxiosRequestConfig, options?: AxiosRequestConfig): AxiosPromise<IDavinciResponse<object>> {
  const axiosPromise =
    typeof url === 'string' ? axios(url, options) : axios(url)
  return axiosPromise
    .then(refreshToken)
    .then(parseJSON)
}

export function setToken (token: string) {
  localStorage.setItem('TOKEN', token)
  localStorage.setItem('TOKEN_EXPIRE', `${new Date().getTime() + tokenExpired}`)
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

function syncToken (e: StorageEvent) {
  const { key, newValue } = e
  if (key !== 'TOKEN') { return }
  if (!newValue) {
    delete axios.defaults.headers.common['Authorization']
  } else {
    axios.defaults.headers.common['Authorization'] = `Bearer ${newValue}`
  }
}

export function removeToken () {
  localStorage.removeItem('TOKEN')
  localStorage.removeItem('TOKEN_EXPIRE')
  delete axios.defaults.headers.common['Authorization']

}

export function getToken () {
  return axios.defaults.headers.common['Authorization']
}

export function setTokenExpired(expired) {
  tokenExpired = Number(expired)
}

window.addEventListener('storage', syncToken)

interface IDavinciResponseHeader {
  code: number
  msg: string
  token: string
}

export interface IDavinciResponse<T> {
  header: IDavinciResponseHeader,
  payload: T
}


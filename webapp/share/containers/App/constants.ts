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

import { createTypes } from 'app/utils/redux'

enum Types {
  DEFAULT_LOCALE = 'en',
  LOGIN = 'davinci/Share/App/LOGIN',
  LOGGED = 'davinci/Share/App/LOGGED',
  LOGON_FAILURE = 'davinci/Share/App/LOGON_FAILURE',
  LOGOUT = 'davinci/Share/App/LOGOUT',
  GET_LOGIN_USER = 'davinci/Share/App/GET_LOGIN_USER',
  INTERCEPTOR_PREFLIGHT = 'davinci/Share/App/INTERCEPTOR_PREFLIGHT',
  INTERCEPTOR_PREFLIGHT_SUCCESS = 'davinci/Share/App/INTERCEPTOR_PREFLIGHT_SUCCESS',
  INTERCEPTOR_PREFLIGHT_FAIL = 'davinci/Share/App/INTERCEPTOR_PREFLIGHT_FAIL',
  GET_PERMISSIONS = 'davinci/Share/App/GET_PERMISSIONS',
  GET_PERMISSIONS_SUCCESS = 'davinci/Share/App/GET_PERMISSIONS_SUCCESS',
  GET_PERMISSIONS_FAIL = 'davinci/Share/App/GET_PERMISSIONS_FAIL',
  PASSWORD_SHARE_TOKENS = 'davinci/Share/PASSWORD_SHARE_TOKENS',
  AUTH_SHARE_TOKEN = 'davinci/Share/AUTH_SHARE_TOKEN',
  GET_SERVER_CONFIGURATIONS = 'davinci/Share/GET_SERVER_CONFIGURATIONS',
  GET_SERVER_CONFIGURATIONS_SUCCESS = 'davinci/Share/GET_SERVER_CONFIGURATIONS_SUCCESS',
  GET_SERVER_CONFIGURATIONS_FAIL = 'davinci/Share/GET_SERVER_CONFIGURATIONS_FAIL'
}

export const ActionTypes = createTypes(Types)

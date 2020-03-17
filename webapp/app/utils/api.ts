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

import config, { env } from '../globalConfig'

const host = config[env].host

export default {
  externalAuthProviders: `${host}/login/getOauth2Clients`,
  tryExternalAuth: `${host}/login/externalLogin`,
  externalLogout: `/login/oauth2/logout`,
  login: `${host}/login`,
  group: `${host}/groups`,
  user: `${host}/users`,
  changepwd: `${host}/changepwd`,
  source: `${host}/sources`,
  bizlogic: `${host}/views`,
  view: `${host}/views`,
  // bizdata: `${host}/bizdatas`,
  widget: `${host}/widgets`,
  display: `${host}/displays`,
  share: `${host}/share`,
  checkName: `${host}/check`,
  projectsCheckName: `${host}/check/`,
  uploads: `${host}/uploads`,
  schedule: `${host}/cronjobs`,
  signup: `${host}/users`,
  organizations: `${host}/organizations`,
  checkNameUnique: `${host}/check`,
  projects: `${host}/projects`,
  teams: `${host}/teams`,
  roles: `${host}/roles`,
  portal: `${host}/dashboardPortals`,
  star: `${host}/star`,
  download: `${host}/download`,
  buriedPoints: `${host}/statistic`
}
